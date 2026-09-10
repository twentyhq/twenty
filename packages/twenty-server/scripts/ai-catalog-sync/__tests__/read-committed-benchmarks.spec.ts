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

  it('recovers every measurement', () => {
    const index = readCommittedBenchmarks(writeOverlay(PUBLISHED));
    const record = index.get('claudesonnet5');

    expect(record?.intelligenceIndex).toBe(38.4);
    expect(record?.outputTokensPerSecond).toBe(92.1);
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

    expect(result?.benchmark.measuredAt).toBe('2026-09-01');
  });

  it('recovers per-effort readings under their effort keys, dated when they were taken', () => {
    const index = readCommittedBenchmarks(
      writeOverlay({
        ...PUBLISHED,
        models: {
          'claude-sonnet-5': {
            ...PUBLISHED.models['claude-sonnet-5'],
            effort: 'max',
            benchmarkByEffort: {
              low: {
                intelligenceIndex: 20.1,
                measuredAt: '2026-09-01',
                aliases: ['Claude Sonnet 5 (low)'],
              },
            },
          },
        },
      }),
    );

    expect(index.get('claudesonnet5')?.effort).toBe('max');
    expect(index.get('claudesonnet5@low')?.intelligenceIndex).toBe(20.1);
    expect(index.get('claudesonnet5@low')?.effort).toBe('low');
    expect(index.get('claudesonnet5@low')?.measuredAt).toBe('2026-09-01');
    expect(index.get('claudesonnet5@max')).toBeUndefined();

    const result = matchBenchmarks({
      modelName: 'claude-sonnet-5',
      siblingModels: {},
      benchmarkIndex: index,
      measuredAt: '2026-09-09',
      efforts: ['low', 'max'],
    });

    expect(result?.benchmarkByEffort?.low?.measuredAt).toBe('2026-09-01');
    expect(result?.benchmarkByEffort?.max).toBeUndefined();
  });

  it('ignores a per-effort key it does not recognise', () => {
    const index = readCommittedBenchmarks(
      writeOverlay({
        ...PUBLISHED,
        models: {
          'claude-sonnet-5': {
            ...PUBLISHED.models['claude-sonnet-5'],
            benchmarkByEffort: {
              turbo: { intelligenceIndex: 99, aliases: [] },
            },
          },
        },
      }),
    );

    expect([...index.keys()].some((key) => key.includes('@'))).toBe(false);
  });

  it('trusts the key over a nested reading that names another effort', () => {
    const index = readCommittedBenchmarks(
      writeOverlay({
        ...PUBLISHED,
        models: {
          'claude-sonnet-5': {
            ...PUBLISHED.models['claude-sonnet-5'],
            benchmarkByEffort: {
              low: { intelligenceIndex: 20.1, effort: 'high', aliases: [] },
            },
          },
        },
      }),
    );

    expect(index.get('claudesonnet5@low')?.effort).toBe('low');
  });
});
