import { type ModelsDevModel } from 'src/engine/metadata-modules/ai/ai-models/types/models-dev-model.type';

import { type BenchmarkIndex } from '../types/benchmark-index.type';
import { type BenchmarkRecord } from '../types/benchmark-record.type';
import { buildLookupCandidates } from '../utils/build-lookup-candidates.util';
import { matchBenchmarks } from '../utils/match-benchmarks.util';

const MEASURED_AT = '2026-09-09';

const modelsDevModel = (
  overrides: Partial<ModelsDevModel> = {},
): ModelsDevModel => ({
  id: 'model',
  name: 'Model',
  cost: { input: 2, output: 6 },
  limit: { context: 128000, output: 8192 },
  ...overrides,
});

const MISTRAL_MODELS: Record<string, ModelsDevModel> = {
  'mistral-large-latest': modelsDevModel({ id: 'mistral-large-latest' }),
  'mistral-large-2512': modelsDevModel({
    id: 'mistral-large-2512',
    release_date: '2025-12-01',
  }),
  'mistral-large-2411': modelsDevModel({
    id: 'mistral-large-2411',
    release_date: '2024-11-01',
    cost: { input: 3, output: 9 },
  }),
};

const indexOf = (entries: Record<string, BenchmarkRecord>): BenchmarkIndex =>
  new Map(Object.entries(entries));

const match = (modelName: string, benchmarkIndex: BenchmarkIndex) =>
  matchBenchmarks({
    modelName,
    siblingModels: MISTRAL_MODELS,
    benchmarkIndex,
    measuredAt: MEASURED_AT,
  });

describe('buildLookupCandidates', () => {
  it('resolves a rolling alias to the priced-identical release it points at', () => {
    expect(
      buildLookupCandidates({
        modelName: 'mistral-large-latest',
        siblingModels: MISTRAL_MODELS,
      }),
    ).toContain('mistral-large-2512');
  });

  it('prefers the newest release when several share the same price and limits', () => {
    const candidates = buildLookupCandidates({
      modelName: 'mistral-large-latest',
      siblingModels: {
        ...MISTRAL_MODELS,
        'mistral-large-2506': modelsDevModel({ release_date: '2025-06-01' }),
      },
    });

    expect(candidates).toContain('mistral-large-2512');
    expect(candidates).not.toContain('mistral-large-2506');
  });

  it('resolves the same way whatever order an undated provider lists twins in', () => {
    // Nothing in models.dev hits this today, but the resolution must not depend
    // on the order a third party happens to serialize its models in.
    const undated = {
      'mistral-large-latest': modelsDevModel({ id: 'mistral-large-latest' }),
      'mistral-large-2506': modelsDevModel({ id: 'mistral-large-2506' }),
      'mistral-large-2512': modelsDevModel({ id: 'mistral-large-2512' }),
    };

    const resolve = (siblingModels: Record<string, ModelsDevModel>) =>
      buildLookupCandidates({
        modelName: 'mistral-large-latest',
        siblingModels,
      });

    const reordered = {
      'mistral-large-latest': undated['mistral-large-latest'],
      'mistral-large-2512': undated['mistral-large-2512'],
      'mistral-large-2506': undated['mistral-large-2506'],
    };

    [undated, reordered].forEach((siblingModels) => {
      const candidates = resolve(siblingModels);

      expect(candidates).toContain('mistral-large-2512');
      expect(candidates).not.toContain('mistral-large-2506');
    });
  });

  it('does not offer the undated name once the alias resolves to a release', () => {
    // The leaderboard's bare `mistral-large` row is the Feb '24 model. Letting
    // it stand in for the release `-latest` currently points at published a
    // two-year-old score as the current one.
    const candidates = buildLookupCandidates({
      modelName: 'mistral-large-latest',
      siblingModels: MISTRAL_MODELS,
    });

    expect(candidates).toContain('mistral-large-2512');
    expect(candidates).not.toContain('mistral-large');
  });

  it('offers no undated spelling of a resolved full-date release either', () => {
    // The publisher's undated row is whichever snapshot it last measured, which
    // is the same trap as the bare rolling name in a longer date format.
    const candidates = buildLookupCandidates({
      modelName: 'claude-sonnet-5-latest',
      siblingModels: {
        'claude-sonnet-5-latest': modelsDevModel({
          id: 'claude-sonnet-5-latest',
        }),
        'claude-sonnet-5-20260101': modelsDevModel({
          id: 'claude-sonnet-5-20260101',
          release_date: '2026-01-01',
        }),
      },
    });

    expect(candidates).toContain('claude-sonnet-5-20260101');
    expect(candidates).not.toContain('claude-sonnet-5');
  });

  it('falls back to the undated name when no release can be resolved', () => {
    const candidates = buildLookupCandidates({
      modelName: 'mistral-large-latest',
      siblingModels: {
        'mistral-large-latest': modelsDevModel({ id: 'mistral-large-latest' }),
      },
    });

    expect(candidates).toContain('mistral-large');
  });

  it('offers the undated name for a dated snapshot', () => {
    expect(
      buildLookupCandidates({
        modelName: 'claude-sonnet-4-5-20250929',
        siblingModels: {},
      }),
    ).toContain('claude-sonnet-4-5');
  });
});

describe('matchBenchmarks', () => {
  it('scores a rolling alias from the release it resolves to', () => {
    const result = match(
      'mistral-large-latest',
      indexOf({ mistrallarge2512: { intelligenceIndex: 41, aliases: [] } }),
    );

    expect(result?.benchmark.intelligenceIndex).toBe(41);
    expect(result?.benchmark.measuredAt).toBe(MEASURED_AT);
  });

  it('carries speed and cost per task through to the catalog', () => {
    const result = match(
      'mistral-large-2512',
      indexOf({
        mistrallarge2512: {
          outputTokensPerSecond: 92,
          costPerTask: 0.42,
          aliases: [],
        },
      }),
    );

    expect(result?.benchmark.outputTokensPerSecond).toBe(92);
    expect(result?.benchmark.costPerTask).toBe(0.42);
  });

  it('returns nothing for a model absent from the index', () => {
    expect(match('mistral-large-2512', new Map())).toBeUndefined();
  });

  it('returns nothing for a matched row carrying no measurement at all', () => {
    // The publisher lists models it has measured nothing about; matching one
    // must not produce an entry holding only a timestamp.
    expect(
      match(
        'mistral-large-2512',
        indexOf({ mistrallarge2512: { aliases: ['mistral-large-2512'] } }),
      ),
    ).toBeUndefined();
  });

  it('prefers the release a rolling alias resolves to over an undated row', () => {
    const result = match(
      'mistral-large-latest',
      indexOf({
        mistrallarge: { intelligenceIndex: 20, aliases: [] },
        mistrallarge2512: { intelligenceIndex: 41, aliases: [] },
      }),
    );

    expect(result?.benchmark.intelligenceIndex).toBe(41);
  });

  it('collects the aliases the publisher gives so consumers can join on them', () => {
    const result = match(
      'mistral-large-2512',
      indexOf({
        mistrallarge2512: {
          intelligenceIndex: 41,
          aliases: ['mistral-large-2512', 'mistralai/mistral-large-2512'],
        },
      }),
    );

    expect(result?.aliases).toEqual([
      'mistral-large-2512',
      'mistralai/mistral-large-2512',
    ]);
  });

  it('reads each declared effort from the row taken at that effort', () => {
    const result = matchBenchmarks({
      modelName: 'mistral-large-2512',
      siblingModels: MISTRAL_MODELS,
      benchmarkIndex: indexOf({
        mistrallarge2512: {
          intelligenceIndex: 41,
          effort: 'high',
          aliases: ['Mistral Large 3 (high)'],
        },
        'mistrallarge2512@high': {
          intelligenceIndex: 41,
          effort: 'high',
          aliases: ['Mistral Large 3 (high)'],
        },
        'mistrallarge2512@none': {
          intelligenceIndex: 22,
          costPerTask: 0.1,
          effort: 'none',
          aliases: ['Mistral Large 3 (Non-reasoning)'],
        },
      }),
      measuredAt: MEASURED_AT,
      efforts: ['none', 'high'],
    });

    expect(result?.benchmark.effort).toBe('high');
    expect(result?.benchmarkByEffort?.none).toEqual({
      intelligenceIndex: 22,
      costPerTask: 0.1,
      effort: 'none',
      measuredAt: MEASURED_AT,
      aliases: ['Mistral Large 3 (Non-reasoning)'],
    });
    expect(result?.benchmarkByEffort?.high?.intelligenceIndex).toBe(41);
  });

  it('leaves a declared effort without its own row blank rather than lending it the ceiling', () => {
    const result = matchBenchmarks({
      modelName: 'mistral-large-2512',
      siblingModels: MISTRAL_MODELS,
      benchmarkIndex: indexOf({
        mistrallarge2512: {
          intelligenceIndex: 41,
          effort: 'high',
          aliases: [],
        },
        'mistrallarge2512@high': {
          intelligenceIndex: 41,
          effort: 'high',
          aliases: [],
        },
      }),
      measuredAt: MEASURED_AT,
      efforts: ['none', 'high'],
    });

    expect(result?.benchmarkByEffort?.none).toBeUndefined();
    expect(result?.benchmarkByEffort?.high?.intelligenceIndex).toBe(41);
  });

  it('carries no effort map at all when no declared effort has a row', () => {
    const result = matchBenchmarks({
      modelName: 'mistral-large-2512',
      siblingModels: MISTRAL_MODELS,
      benchmarkIndex: indexOf({
        mistrallarge2512: { intelligenceIndex: 41, aliases: [] },
      }),
      measuredAt: MEASURED_AT,
      efforts: ['none', 'high'],
    });

    expect(result?.benchmark.intelligenceIndex).toBe(41);
    expect(result?.benchmarkByEffort).toBeUndefined();
  });

  it('resolves a rolling alias to its release for per-effort rows too', () => {
    const result = matchBenchmarks({
      modelName: 'mistral-large-latest',
      siblingModels: MISTRAL_MODELS,
      benchmarkIndex: indexOf({
        mistrallarge2512: { intelligenceIndex: 41, aliases: [] },
        'mistrallarge2512@high': {
          intelligenceIndex: 41,
          effort: 'high',
          aliases: [],
        },
        'mistrallarge@high': {
          intelligenceIndex: 20,
          effort: 'high',
          aliases: [],
        },
      }),
      measuredAt: MEASURED_AT,
      efforts: ['high'],
    });

    expect(result?.benchmarkByEffort?.high?.intelligenceIndex).toBe(41);
  });

  it('labels a per-effort reading with the key it was filed under', () => {
    const result = matchBenchmarks({
      modelName: 'mistral-large-2512',
      siblingModels: MISTRAL_MODELS,
      benchmarkIndex: indexOf({
        mistrallarge2512: { intelligenceIndex: 41, aliases: [] },
        'mistrallarge2512@low': {
          intelligenceIndex: 30,
          effort: 'high',
          aliases: [],
        },
      }),
      measuredAt: MEASURED_AT,
      efforts: ['low'],
    });

    expect(result?.benchmarkByEffort?.low?.effort).toBe('low');
  });
});
