import type { AggregatedResult, Test } from '@jest/test-result';
import type { ShardOptions } from '@jest/test-sequencer';

const fs: typeof import('fs') = require('fs');
const path: typeof import('path') = require('path');
const {
  default: Sequencer,
}: typeof import('@jest/test-sequencer') = require('@jest/test-sequencer');

type TestWithDuration = {
  test: Test;
  relativePath: string;
  duration: number;
};

type Shard = {
  duration: number;
  tests: Test[];
};

const readTimings = (
  timingsFile: string | undefined,
): Record<string, number> => {
  if (!timingsFile || !fs.existsSync(timingsFile)) {
    return {};
  }

  try {
    const timings: Record<string, unknown> = JSON.parse(
      fs.readFileSync(timingsFile, 'utf8'),
    );

    return Object.fromEntries(
      Object.entries(timings).filter(
        (entry): entry is [string, number] =>
          typeof entry[1] === 'number' && entry[1] > 0,
      ),
    );
  } catch {
    return {};
  }
};

const getMedian = (values: number[]): number => {
  const sortedValues = [...values].sort((a, b) => a - b);

  return sortedValues[Math.floor(sortedValues.length / 2)];
};

const compareByDurationThenPath = (
  a: TestWithDuration,
  b: TestWithDuration,
): number => {
  if (a.duration !== b.duration) {
    return b.duration - a.duration;
  }

  return a.relativePath < b.relativePath ? -1 : 1;
};

class IntegrationTestSequencer extends Sequencer {
  shard(tests: Test[], options: ShardOptions): Test[] | Promise<Test[]> {
    const timings = readTimings(process.env.INTEGRATION_TEST_TIMINGS_FILE);
    const knownDurations = Object.values(timings);

    if (knownDurations.length === 0) {
      process.stdout.write(
        'No integration test timings found, using default shard split\n',
      );

      return super.shard(tests, options);
    }

    const defaultDuration = getMedian(knownDurations);

    const testsWithDuration: TestWithDuration[] = tests
      .map((test) => {
        const relativePath = path.relative(
          test.context.config.rootDir,
          test.path,
        );

        return {
          test,
          relativePath,
          duration: timings[relativePath] ?? defaultDuration,
        };
      })
      .sort(compareByDurationThenPath);

    const shards: Shard[] = Array.from({ length: options.shardCount }, () => ({
      duration: 0,
      tests: [],
    }));

    for (const testWithDuration of testsWithDuration) {
      const lightestShard = shards.reduce((lightest, shard) =>
        shard.duration < lightest.duration ? shard : lightest,
      );

      lightestShard.tests.push(testWithDuration.test);
      lightestShard.duration += testWithDuration.duration;
    }

    const currentShard = shards[options.shardIndex - 1];

    process.stdout.write(
      `Shard ${options.shardIndex}/${options.shardCount}: ${currentShard.tests.length} specs, ~${Math.round(currentShard.duration / 1000)}s expected\n`,
    );

    return currentShard.tests;
  }

  cacheResults(tests: Test[], results: AggregatedResult): void {
    super.cacheResults(tests, results);

    const outputFile = process.env.INTEGRATION_TEST_TIMINGS_OUTPUT_FILE;

    if (!outputFile || tests.length === 0) {
      return;
    }

    const rootDir = tests[0].context.config.rootDir;
    const timings: Record<string, number> = {};

    for (const testResult of results.testResults) {
      if (
        testResult.skipped ||
        testResult.testExecError ||
        testResult.numFailingTests > 0
      ) {
        continue;
      }

      timings[path.relative(rootDir, testResult.testFilePath)] =
        testResult.perfStats.runtime;
    }

    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(outputFile, JSON.stringify(timings, null, 2));
  }
}

module.exports = IntegrationTestSequencer;
