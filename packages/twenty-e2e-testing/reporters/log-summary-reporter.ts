import type {
  Reporter,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';

class LogSummaryReporter implements Reporter {
  private passed: string[] = [];
  private failed: string[] = [];

  onTestEnd(test: TestCase, result: TestResult): void {
    const name = test.titlePath().join(' › ');

    if (result.status === 'passed') {
      this.passed.push(name);
      return;
    }

    if (result.status === 'failed' || result.status === 'timedOut') {
      this.failed.push(name);
    }
  }

  onEnd(): void {
    console.log('\n=== Playwright summary ===');
    console.log('Passed:');
    this.passed.forEach((testName) => console.log(`  ✅ ${testName}`));
    console.log('Failed:');
    this.failed.forEach((testName) => console.log(`  ❌ ${testName}`));
  }
}

export default LogSummaryReporter;
