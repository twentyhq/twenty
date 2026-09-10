import * as fs from 'fs';

import { type AiModelEffort, isAiModelEffort } from 'twenty-shared/ai';

import { buildEffortLookupKey } from './build-effort-lookup-key.util';
import { normalizeModelName } from './normalize-model-name.util';
import { type BenchmarkIndex } from '../types/benchmark-index.type';
import { type BenchmarkRecord } from '../types/benchmark-record.type';

type CommittedReading = Partial<BenchmarkRecord> & {
  measuredAt?: string;
  aliases?: string[];
};

type CommittedEntry = CommittedReading & {
  benchmarkByEffort?: Partial<Record<AiModelEffort, CommittedReading>>;
};

const toRecord = ({
  reading,
  modelName,
  effort,
}: {
  reading: CommittedReading;
  modelName: string;
  effort?: AiModelEffort;
}): BenchmarkRecord => ({
  intelligenceIndex: reading.intelligenceIndex,
  outputTokensPerSecond: reading.outputTokensPerSecond,
  costPerTask: reading.costPerTask,
  effort: reading.effort ?? effort,
  measuredAt: reading.measuredAt,
  aliases: reading.aliases ?? [modelName],
});

const file = ({
  index,
  record,
  modelName,
  toKey,
}: {
  index: BenchmarkIndex;
  record: BenchmarkRecord;
  modelName: string;
  toKey: (normalizedName: string) => string;
}): void => {
  for (const alias of record.aliases) {
    const key = normalizeModelName(alias);

    if (key.length > 0 && !index.has(toKey(key))) {
      index.set(toKey(key), record);
    }
  }

  // An entry always claims its own name, whatever a sibling's alias list says.
  const ownKey = normalizeModelName(modelName);

  if (ownKey.length > 0) {
    index.set(toKey(ownKey), record);
  }
};

// The last published measurements, read back so a failed fetch degrades to
// stale data rather than deleting the catalog's benchmarks. Each record keeps
// its own measuredAt, so a stale entry stays visibly stale.
export const readCommittedBenchmarks = (filePath: string): BenchmarkIndex => {
  if (!fs.existsSync(filePath)) {
    return new Map();
  }

  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as {
    models?: Record<string, CommittedEntry>;
  };

  const index: BenchmarkIndex = new Map();

  for (const [modelName, entry] of Object.entries(parsed.models ?? {})) {
    file({
      index,
      record: toRecord({ reading: entry, modelName }),
      modelName,
      toKey: (normalizedName) => normalizedName,
    });

    for (const [effort, reading] of Object.entries(
      entry.benchmarkByEffort ?? {},
    )) {
      if (!isAiModelEffort(effort)) {
        continue;
      }

      file({
        index,
        record: toRecord({ reading, modelName, effort }),
        modelName,
        toKey: (normalizedName) => buildEffortLookupKey(normalizedName, effort),
      });
    }
  }

  return index;
};
