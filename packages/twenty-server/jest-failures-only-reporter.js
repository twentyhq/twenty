class JestFailuresOnlyReporter {
  constructor() {
    this._failures = [];
  }

  onTestResult(_test, testResult) {
    if (testResult.numFailingTests === 0 && !testResult.testExecError) {
      return;
    }

    const relativePath = testResult.testFilePath.replace(
      process.cwd() + '/',
      '',
    );

    process.stderr.write(`\n\x1b[31mFAIL\x1b[0m ${relativePath}\n`);

    if (testResult.failureMessage) {
      process.stderr.write(testResult.failureMessage + '\n');
    }

    if (testResult.testExecError) {
      process.stderr.write(
        `\n  Runtime error: ${testResult.testExecError.message}\n`,
      );
    }

    this._failures.push({ path: relativePath, testResult });
  }

  onRunComplete(_testContexts, aggregatedResults) {
    const {
      numPassedTestSuites,
      numFailedTestSuites,
      numTotalTestSuites,
      numPassedTests,
      numFailedTests,
      numTotalTests,
    } = aggregatedResults;

    process.stderr.write('\n');

    if (this._failures.length > 0) {
      process.stderr.write(
        `\x1b[31m${'='.repeat(60)}\x1b[0m\n` +
          `\x1b[31m FAILED TEST SUITES SUMMARY\x1b[0m\n` +
          `\x1b[31m${'='.repeat(60)}\x1b[0m\n\n`,
      );

      for (const failure of this._failures) {
        process.stderr.write(`  \x1b[31m✕\x1b[0m ${failure.path}\n`);

        const failedTests = failure.testResult.testResults.filter(
          (result) => result.status === 'failed',
        );

        for (const failedTest of failedTests) {
          process.stderr.write(`    \x1b[31m→\x1b[0m ${failedTest.fullName}\n`);
        }

        process.stderr.write('\n');
      }

      process.stderr.write(`\x1b[31m${'='.repeat(60)}\x1b[0m\n\n`);
    }

    const suiteSummary =
      `Test Suites: ` +
      (numFailedTestSuites > 0
        ? `\x1b[31m${numFailedTestSuites} failed\x1b[0m, `
        : '') +
      (numPassedTestSuites > 0
        ? `\x1b[32m${numPassedTestSuites} passed\x1b[0m, `
        : '') +
      `${numTotalTestSuites} total`;

    const testSummary =
      `Tests:       ` +
      (numFailedTests > 0 ? `\x1b[31m${numFailedTests} failed\x1b[0m, ` : '') +
      (numPassedTests > 0 ? `\x1b[32m${numPassedTests} passed\x1b[0m, ` : '') +
      `${numTotalTests} total`;

    process.stderr.write(suiteSummary + '\n');
    process.stderr.write(testSummary + '\n');
  }
}

module.exports = JestFailuresOnlyReporter;
