import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { matchBenchmarks } from '../utils/match-benchmarks.util';
import { readCommittedBenchmarks } from '../utils/read-committed-benchmarks.util';

const writeOverlay = (value: unknown): string => {
  const filePath = path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), 'overlay-')),
    'ai-model-benchmarks.json',
  );

  fs.writeFileSync(filePath, JSON.stringify(value), 'utf-8');

  return filePath;
};

const PUBLISHED = {
  source: 'artificialanalysis.ai',
  measuredAt: '2026-09-01',
  models: {
    'claude-sonnet-5': {
      intelligenceIndex: 38.4,
      outputTokensPerSecond: 92.1,
      measuredAt: '2026-09-01',
      aliases: ['claude-sonnet-5', 'claude-sonnet-5-20260630'],
      artificialAnalysisPrices: { inputPerMillionTokens: 2 },
    },
  },
};

describe('readCommittedBenchmarks', () => {
  it('returns nothing when no overlay has been published yet', () => {
    expect(
      readCommittedBenchmarks(path.join(os.tmpdir(), 'does-not-exist.json'))
        .size,
    ).toBe(0);
  });

  it('recovers every measurement, including the observed prices', () => {
    const index = readCommittedBenchmarks(writeOverlay(PUBLISHED));
    const record = index.get('claudesonnet5');

    expect(record?.intelligenceIndex).toBe(38.4);
    expect(record?.outputTokensPerSecond).toBe(92.1);
    expect(record?.observedPrices?.inputPerMillionTokens).toBe(2);
  });

  it('indexes the published aliases so matching still resolves them', () => {
    const index = readCommittedBenchmarks(writeOverlay(PUBLISHED));

    expect(index.get('claudesonnet520260630')?.intelligenceIndex).toBe(38.4);
  });

  it('keeps a preserved measurement dated when it was taken, not today', () => {
    // Restamping recovered data as measured today would present a stale
    // benchmark as fresh on every failed run.
    const index = readCommittedBenchmarks(writeOverlay(PUBLISHED));

    const result = matchBenchmarks({
      modelName: 'claude-sonnet-5',
      siblingModels: {},
      benchmarkIndex: index,
      measuredAt: '2026-09-09',
    });

    expect(result?.benchmarks?.measuredAt).toBe('2026-09-01');
  });
});
