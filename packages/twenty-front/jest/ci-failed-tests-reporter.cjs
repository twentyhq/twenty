// Prints a high-visibility failure summary after the run and emits GitHub
// Actions workflow commands so failed tests show in job Annotations.

const escapeGithubProperty = (value) =>
  String(value)
    .replace(/%/g, '%25')
    .replace(/\r/g, '%0D')
    .replace(/\n/g, '%0A');

const toRepoRelativePath = (absolutePath) => {
  const workspaceRoot = process.env.GITHUB_WORKSPACE || process.cwd();
  const prefix = `${workspaceRoot}/`;

  return absolutePath.startsWith(prefix)
    ? absolutePath.slice(prefix.length)
    : absolutePath;
};

class CiFailedTestsReporter {
  onRunStart() {
    process.stdout.write(
      '\n[twenty-front Jest] On failure, a FAILED TESTS summary is printed after this run (and as GitHub Annotations in CI).\n\n',
    );
  }

  onRunComplete(_contexts, aggregatedResult) {
    if (
      !aggregatedResult ||
      (aggregatedResult.numFailedTests === 0 &&
        aggregatedResult.numFailedTestSuites === 0)
    ) {
      return;
    }

    const blocks = [];
    const githubErrorLines = [];
    const isGithubActions = process.env.GITHUB_ACTIONS === 'true';

    blocks.push('');
    blocks.push(
      '══════════════════════════════════════════════════════════════════════',
    );
    blocks.push(
      `  FAILED TESTS (${aggregatedResult.numFailedTests} assertion(s) in ${aggregatedResult.numFailedTestSuites} file(s))`,
    );
    blocks.push(
      '  (Also surfaced as GitHub Annotations when GITHUB_ACTIONS is set.)',
    );
    blocks.push(
      '══════════════════════════════════════════════════════════════════════',
    );

    for (const testResult of aggregatedResult.testResults) {
      const failedAssertions = testResult.testResults.filter(
        (assertion) => assertion.status === 'failed',
      );

      if (failedAssertions.length === 0 && !testResult.failureMessage) {
        continue;
      }

      blocks.push(`  ${testResult.testFilePath}`);

      if (testResult.failureMessage && failedAssertions.length === 0) {
        blocks.push(`    - (suite or hook failure)`);
        if (isGithubActions) {
          const relativePath = toRepoRelativePath(testResult.testFilePath);
          const title = escapeGithubProperty('Jest: suite failed');
          const message = escapeGithubProperty(
            `${testResult.failureMessage.slice(0, 500)} (${relativePath})`,
          );
          githubErrorLines.push(
            `::error file=${relativePath},title=${title}::${message}`,
          );
        }
      }

      for (const assertion of failedAssertions) {
        blocks.push(`    - ${assertion.fullName}`);

        if (isGithubActions) {
          const relativePath = toRepoRelativePath(testResult.testFilePath);
          const title = escapeGithubProperty(
            `Jest: ${assertion.fullName.slice(0, 200)}`,
          );
          const message = escapeGithubProperty(
            `Failed: ${assertion.fullName} (${relativePath})`,
          );
          githubErrorLines.push(
            `::error file=${relativePath},title=${title}::${message}`,
          );
        }
      }
    }

    blocks.push(
      '══════════════════════════════════════════════════════════════════════',
    );
    blocks.push('');

    process.stdout.write(`${blocks.join('\n')}\n`);

    if (githubErrorLines.length > 0) {
      process.stdout.write(`${githubErrorLines.join('\n')}\n`);
    }
  }
}

module.exports = CiFailedTestsReporter;
