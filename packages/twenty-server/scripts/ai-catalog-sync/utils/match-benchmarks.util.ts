import { type AiModelEffort } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type AiModelBenchmark } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-benchmark.type';

import { type BenchmarkIndex } from '../types/benchmark-index.type';
import { type BenchmarkMatch } from '../types/benchmark-match.type';
import { type BenchmarkOverlayReading } from '../types/benchmark-overlay-entry.type';
import { type BenchmarkRecord } from '../types/benchmark-record.type';
import { type MatchBenchmarksArgs } from '../types/match-benchmarks-args.type';

import { buildEffortLookupKey } from './build-effort-lookup-key.util';
import { buildLookupCandidates } from './build-lookup-candidates.util';
import { normalizeModelName } from './normalize-model-name.util';

const lookup = (
  index: BenchmarkIndex,
  keys: string[],
): BenchmarkRecord | undefined => {
  for (const key of keys) {
    const record = index.get(key);

    if (isDefined(record)) {
      return record;
    }
  }

  return undefined;
};

// The publisher lists plenty of models it has measured nothing about, and a row
// of pure aliases says nothing worth carrying into either artifact.
const hasMeasurement = (record: BenchmarkRecord): boolean =>
  [
    record.intelligenceIndex,
    record.outputTokensPerSecond,
    record.costPerTask,
  ].some(isDefined);

const toBenchmark = (
  record: BenchmarkRecord,
  measuredAt: string,
): AiModelBenchmark => ({
  intelligenceIndex: record.intelligenceIndex,
  outputTokensPerSecond: record.outputTokensPerSecond,
  costPerTask: record.costPerTask,
  effort: record.effort,
  measuredAt: record.measuredAt ?? measuredAt,
});

export const matchBenchmarks = ({
  modelName,
  siblingModels,
  benchmarkIndex,
  measuredAt,
  efforts,
}: MatchBenchmarksArgs): BenchmarkMatch | undefined => {
  const keys = buildLookupCandidates({ modelName, siblingModels }).map(
    normalizeModelName,
  );

  const record = lookup(benchmarkIndex, keys);

  if (!isDefined(record) || !hasMeasurement(record)) {
    return undefined;
  }

  const benchmarkByEffort: Partial<
    Record<AiModelEffort, BenchmarkOverlayReading>
  > = {};

  // A declared effort without a row of its own stays blank: the ceiling was
  // measured at another effort and would overstate it.
  for (const effort of efforts ?? []) {
    const effortRecord = lookup(
      benchmarkIndex,
      keys.map((key) => buildEffortLookupKey(key, effort)),
    );

    if (isDefined(effortRecord) && hasMeasurement(effortRecord)) {
      benchmarkByEffort[effort] = {
        ...toBenchmark(effortRecord, measuredAt),
        aliases: [...new Set(effortRecord.aliases)],
      };
    }
  }

  return {
    benchmark: toBenchmark(record, measuredAt),
    aliases: [...new Set([modelName, ...record.aliases])],
    ...(Object.keys(benchmarkByEffort).length > 0 ? { benchmarkByEffort } : {}),
  };
};
