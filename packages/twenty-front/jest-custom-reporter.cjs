const chalk = require('chalk');
const path = require('path');

class CustomReporter {
  onRunComplete(contexts, results) {
    const failedTests = results.testResults.filter((testResult) => {
      return testResult.numFailingTests > 0;
    });

    if (failedTests.length > 0) {
      console.log(chalk.bold("\nFAILED TEST(S):\n"));
      failedTests.forEach(function(test) {
        const testFilePath = path.relative(process.cwd(), test.testFilePath);;
        console.error(chalk.bold.red.bgRed(" FAIL "), chalk.bold.red(testFilePath));
      });
    } else {
      console.log(chalk.bold.black.bgGreen("\n SUCCESS "), chalk.bold.green("All tests passed successfully."));
    }
  }
}

module.exports = CustomReporter;
