function Question(args) {
    this.id = args.id;
    this.title = args.title;
    this.text = args.text;
    this.answer1 = args.answer1;
    this.answer2 = args.answer2;
    this.answer3 = args.answer3;
    this.answer4 = args.answer4;
    this.correct = args.correct;
    this.difficulty = args.difficulty;
}

var chosen = GetQuestion("easy");
var easyRequired = 10;
var mediumRequired = 15;
var hardRequired = 20;
var numberWrong = 5;
var totalQsMore = 5;

angular.module('assessments', [])
    .controller('AssessmentsController', ['$scope', function ($scope) {
        
        $scope.testRunning = true;
        $scope.EasyQsCompleted = 0;
        $scope.MediumQsCompleted = 0;
        $scope.HardQsCompleted = 0;
        $scope.WrongInARow = 0;
        $scope.CurrentLevel = 0;
        $scope.NextQuestion = 0;
        $scope.QsAtCurrentLevel = 0;
        $scope.lastWrong = false;
        $scope.assessmentLevel = 0;
        $scope.TotalQuestions = 0;
        
        $scope.wereYouRight = "";
        
        
        console.log("Chosen returned:", chosen);
        
        $scope.newQuestion = function (level) {
            var levelText = "easy";
            if (level == 1) levelText = "medium";
            if (level == 2) levelText = "hard";
            
            chosen = GetQuestion(levelText);
            console.log("Chosen returned:", chosen);
        
            while (chosen.title === undefined || chosen.id == "ID") GetQuestion(levelText);
            
            $scope.TotalQuestions += 1;
            
            $scope.QuestionTitle = chosen.title;
            $scope.QuestionText = chosen.text;
            $scope.answer1 = chosen.answer1;
            $scope.answer2 = chosen.answer2;
            $scope.answer3 = chosen.answer3;
            $scope.answer4 = chosen.answer4;
        }

        $scope.supplyAnswer = function(id) {
            if (id == chosen.correct) {
                // message
                $scope.wereYouRight = "Correct!";
                
                // update logic
                if ($scope.CurrentLevel <= 0 && $scope.NextQuestion >= 0 && $scope.EasyQsCompleted < easyRequired) $scope.EasyQsCompleted += 1;
                if ($scope.CurrentLevel <= 1 && $scope.NextQuestion >= 1 && $scope.MediumQsCompleted < mediumRequired) $scope.MediumQsCompleted += 1;
                if ($scope.CurrentLevel <= 2 && $scope.NextQuestion >= 2 && $scope.HardQsCompleted < mediumRequired) $scope.HardQsCompleted += 1;

                $scope.lastWrong = false;
                $scope.WrongInARow = 0;
                if ($scope.CurrentLevel == 0 && $scope.EasyQsCompleted >= easyRequired) $scope.CurrentLevel += 1;
                if ($scope.CurrentLevel == 1 && $scope.MediumQsCompleted >= mediumRequired) $scope.CurrentLevel += 1;
                if ($scope.CurrentLevel == 2 && $scope.HardQsCompleted >= hardRequired) {
                    $scope.wereYouRight = "Winner, winner, chicken dinner!  You are an expert!";
                    $scope.testRunning = false;
                }
                
                $scope.assessmentLevel = Math.floor((($scope.EasyQsCompleted / easyRequired) * 0.2
                                            + ($scope.MediumQsCompleted / mediumRequired) * 0.3
                                            + ($scope.HardQsCompleted / hardRequired) * 0.5) * 100);
                
                // next question logic
                if ($scope.NextQuestion == 1) $scope.NextQuestion = 2;
                if ($scope.NextQuestion == 0) $scope.NextQuestion = 1;
                
                
            } else{
                // message
                $scope.wereYouRight = "Wrong, loser";
                
                // update logic
                $scope.WrongInARow += 1;
                $scope.lastWrong = true;
                if ($scope.WrongInARow >= numberWrong) {
                    $scope.testRunning = false;
                    $scope.wereYouRight = "End of test.  Your knowledge level is assessed as " + $scope.assessmentLevel + "%";
                    return;
                }
                
                // next question logic
                if ($scope.NextQuestion == 1 && $scope.CurrentLevel == 0) $scope.NextQuestion = 0;
                if ($scope.NextQuestion == 2 && $scope.CurrentLevel <= 1) $scope.NextQuestion = 1;
            }
            $scope.QsAtCurrentLevel += 1;
            if (($scope.CurrentLevel == 0 && $scope.QsAtCurrentLevel >= easyRequired + totalQsMore)
                || ($scope.CurrentLevel == 1 && $scope.QsAtCurrentLevel >= mediumRequired + totalQsMore)
                || ($scope.CurrentLevel == 2 && $scope.QsAtCurrentLevel >= hardRequired + totalQsMore)
               ){
                $scope.testRunning = false;
                $scope.wereYouRight = "End of test.  Your knowledge level is assessed as " + $scope.assessmentLevel + "%";
                return;
            }
            
            $scope.newQuestion($scope.NextQuestion);
        }
        
        $scope.newQuestion($scope.NextQuestion);
        
    }]);



function GetQuestion(difficulty)
{
    var url = "easy.csv";
    if (difficulty == "medium") url = "medium.csv";
    if (difficulty == "hard") url = "hard.csv";

    fileText = readTextFile(url);
    //console.log("File text:", fileText);
    
    var results = Papa.parse(fileText);
    
    //console.log("Parsing complete:", results);
            
    var chooseIndex = Math.floor((results.data.length) * Math.random());
    var chosen = results.data[chooseIndex];
    //console.log("Chosen question:", chosen);

    var q = new Question({
        id: chosen[0],
        title: chosen[1],
        text: chosen[5],
        answer1: chosen[6],
        answer2: chosen[7],
        answer3: chosen[8],
        answer4: chosen[9],
        correct: chosen[11],
        difficulty: chosen[4]
    });

    return q;
}

function readTextFile(file)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.send();
    return rawFile.responseText;
}