import * as fs from 'fs';

import { normalizeModelName } from './normalize-model-name.util';
import { type BenchmarkIndex, type BenchmarkRecord } from './types';

type CommittedEntry = Partial<BenchmarkRecord> & {
  measuredAt?: string;
  aliases?: string[];
  artificialAnalysisPrices?: BenchmarkRecord['observedPrices'];
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
    const record: BenchmarkRecord = {
      intelligenceIndex: entry.intelligenceIndex,
      outputTokensPerSecond: entry.outputTokensPerSecond,
      timeToFirstTokenSeconds: entry.timeToFirstTokenSeconds,
      costPerTask: entry.costPerTask,
      observedPrices: entry.artificialAnalysisPrices,
      measuredAt: entry.measuredAt,
      aliases: entry.aliases ?? [modelName],
    };

    for (const alias of record.aliases) {
      const key = normalizeModelName(alias);

      if (key.length > 0 && !index.has(key)) {
        index.set(key, record);
      }
    }

    // An entry always claims its own name, whatever a sibling's alias list says.
    const ownKey = normalizeModelName(modelName);

    if (ownKey.length > 0) {
      index.set(ownKey, record);
    }
  }

  return index;
};
