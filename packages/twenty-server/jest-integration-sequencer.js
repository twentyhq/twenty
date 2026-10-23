const fs = require('fs');
const path = require('path');
const Sequencer = require('@jest/test-sequencer').default;

const readTimings = (timingsFile) => {
  if (!timingsFile || !fs.existsSync(timingsFile)) {
    return {};
  }

  try {
    const timings = JSON.parse(fs.readFileSync(timingsFile, 'utf8'));

    return Object.fromEntries(
      Object.entries(timings).filter(
        ([, duration]) => typeof duration === 'number' && duration > 0,
      ),
    );
  } catch {
    return {};
  }
};

const getMedian = (values) => {
  const sortedValues = [...values].sort((a, b) => a - b);

  return sortedValues[Math.floor(sortedValues.length / 2)];
};

const compareByDurationThenPath = (a, b) => {
  if (a.duration !== b.duration) {
    return b.duration - a.duration;
  }

  return a.relativePath < b.relativePath ? -1 : 1;
};

class IntegrationTestSequencer extends Sequencer {
  shard(tests, options) {
    const timings = readTimings(process.env.INTEGRATION_TEST_TIMINGS_FILE);
    const knownDurations = Object.values(timings);

    if (knownDurations.length === 0) {
      console.log(
        'No integration test timings found, using default shard split',
      );

      return super.shard(tests, options);
    }

    const defaultDuration = getMedian(knownDurations);

    const testsWithDuration = tests
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

    const shards = Array.from({ length: options.shardCount }, () => ({
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

    console.log(
      `Shard ${options.shardIndex}/${options.shardCount}: ${currentShard.tests.length} specs, ~${Math.round(currentShard.duration / 1000)}s expected`,
    );

    return currentShard.tests;
  }

  cacheResults(tests, results) {
    super.cacheResults(tests, results);

    const outputFile = process.env.INTEGRATION_TEST_TIMINGS_OUTPUT_FILE;

    if (!outputFile || tests.length === 0) {
      return;
    }

    const rootDir = tests[0].context.config.rootDir;
    const timings = {};

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
