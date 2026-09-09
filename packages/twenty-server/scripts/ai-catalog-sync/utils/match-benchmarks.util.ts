import { isDefined } from 'twenty-shared/utils';

import { type BenchmarkIndex } from '../types/benchmark-index.type';
import { type BenchmarkMatch } from '../types/benchmark-match.type';
import { type BenchmarkRecord } from '../types/benchmark-record.type';
import { type MatchBenchmarksArgs } from '../types/match-benchmarks-args.type';

import { buildLookupCandidates } from './build-lookup-candidates.util';
import { normalizeModelName } from './normalize-model-name.util';

const lookup = (
  index: BenchmarkIndex,
  candidates: string[],
): BenchmarkRecord | undefined => {
  for (const candidate of candidates) {
    const record = index.get(normalizeModelName(candidate));

    if (isDefined(record)) {
      return record;
    }
  }

  return undefined;
};

export const matchBenchmarks = ({
  modelName,
  siblingModels,
  benchmarkIndex,
  measuredAt,
}: MatchBenchmarksArgs): BenchmarkMatch | undefined => {
  const record = lookup(
    benchmarkIndex,
    buildLookupCandidates({ modelName, siblingModels }),
  );

  if (!isDefined(record)) {
    return undefined;
  }

  const { intelligenceIndex, outputTokensPerSecond, costPerTask } = record;

  // The publisher lists plenty of models it has measured nothing about, and a
  // row of pure aliases says nothing worth carrying into either artifact.
  if (
    ![intelligenceIndex, outputTokensPerSecond, costPerTask].some(isDefined)
  ) {
    return undefined;
  }

  return {
    benchmark: {
      intelligenceIndex,
      outputTokensPerSecond,
      costPerTask,
      measuredAt: record.measuredAt ?? measuredAt,
    },
    aliases: [...new Set([modelName, ...record.aliases])],
  };
};
