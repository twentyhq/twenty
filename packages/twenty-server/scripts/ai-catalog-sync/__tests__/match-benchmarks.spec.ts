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

    expect(result?.benchmarks?.intelligenceIndex).toBe(41);
    expect(result?.benchmarks?.measuredAt).toBe(MEASURED_AT);
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

    expect(result?.benchmarks?.outputTokensPerSecond).toBe(92);
    expect(result?.benchmarks?.costPerTask).toBe(0.42);
  });

  it('returns nothing for a model absent from the index', () => {
    expect(match('mistral-large-2512', new Map())).toBeUndefined();
  });

  it('returns nothing for a matched row carrying no measurement at all', () => {
    // The publisher lists models it has measured nothing about; matching one
    // must not produce an overlay entry holding only a timestamp.
    expect(
      match(
        'mistral-large-2512',
        indexOf({ mistrallarge2512: { aliases: ['mistral-large-2512'] } }),
      ),
    ).toBeUndefined();
  });

  it('omits observed prices entirely when the row quotes none', () => {
    const result = match(
      'mistral-large-2512',
      indexOf({
        mistrallarge2512: {
          intelligenceIndex: 41,
          observedPrices: {},
          aliases: [],
        },
      }),
    );

    expect(result?.observedPrices).toBeUndefined();
  });

  it('prefers the release a rolling alias resolves to over an undated row', () => {
    const result = match(
      'mistral-large-latest',
      indexOf({
        mistrallarge: { intelligenceIndex: 20, aliases: [] },
        mistrallarge2512: { intelligenceIndex: 41, aliases: [] },
      }),
    );

    expect(result?.benchmarks?.intelligenceIndex).toBe(41);
  });

  it('emits no benchmarks for a row carrying only a price observation', () => {
    // A phantom benchmarks block reads as "measured and unremarkable" rather
    // than "not measured".
    const result = match(
      'mistral-large-2512',
      indexOf({
        mistrallarge2512: {
          observedPrices: { inputPerMillionTokens: 2 },
          aliases: [],
        },
      }),
    );

    expect(result?.benchmarks).toBeUndefined();
    expect(result?.observedPrices?.inputPerMillionTokens).toBe(2);
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
});
