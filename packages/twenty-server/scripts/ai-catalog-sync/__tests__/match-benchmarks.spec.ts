import { type ModelsDevModel } from 'src/engine/metadata-modules/ai/ai-models/types/models-dev-model.type';

import { buildLookupCandidates, matchBenchmarks } from '../match-benchmarks';
import { type BenchmarkIndex } from '../types';

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

const indexOf = (
  entries: Record<string, Parameters<typeof Object>[0]>,
): BenchmarkIndex => new Map(Object.entries(entries)) as BenchmarkIndex;

describe('buildLookupCandidates', () => {
  it('resolves a rolling alias to the priced-identical release it points at', () => {
    expect(
      buildLookupCandidates('mistral-large-latest', MISTRAL_MODELS),
    ).toContain('mistral-large-2512');
  });

  it('prefers the newest release when several share the same price and limits', () => {
    const candidates = buildLookupCandidates('mistral-large-latest', {
      ...MISTRAL_MODELS,
      'mistral-large-2506': modelsDevModel({ release_date: '2025-06-01' }),
    });

    expect(candidates).toContain('mistral-large-2512');
    expect(candidates).not.toContain('mistral-large-2506');
  });

  it('offers the undated name for a dated snapshot', () => {
    expect(buildLookupCandidates('claude-sonnet-4-5-20250929', {})).toContain(
      'claude-sonnet-4-5',
    );
  });
});

describe('matchBenchmarks', () => {
  const match = (
    modelName: string,
    epoch: BenchmarkIndex,
    artificialAnalysis: BenchmarkIndex,
  ) =>
    matchBenchmarks({
      modelName,
      siblingModels: MISTRAL_MODELS,
      epochIndex: epoch,
      artificialAnalysisIndex: artificialAnalysis,
      measuredAt: MEASURED_AT,
    });

  it('scores a rolling alias from the release it resolves to', () => {
    const result = match(
      'mistral-large-latest',
      indexOf({ mistrallarge2512: { intelligenceIndex: 148.2, aliases: [] } }),
      new Map(),
    );

    expect(result?.benchmarks.intelligenceIndex).toBe(148.2);
    expect(result?.benchmarks.sources).toEqual(['epoch-ai']);
  });

  it('keeps the aggregated index when both sources score the same model', () => {
    const result = match(
      'mistral-large-2512',
      indexOf({ mistrallarge2512: { intelligenceIndex: 148.2, aliases: [] } }),
      indexOf({
        mistrallarge2512: {
          intelligenceIndex: 41,
          outputTokensPerSecond: 92,
          aliases: [],
        },
      }),
    );

    expect(result?.benchmarks.intelligenceIndex).toBe(148.2);
    expect(result?.benchmarks.outputTokensPerSecond).toBe(92);
    expect(result?.benchmarks.sources).toEqual([
      'epoch-ai',
      'artificial-analysis',
    ]);
  });

  it('reports speed and cost even when no source publishes an index', () => {
    const result = match(
      'mistral-large-2512',
      new Map(),
      indexOf({
        mistrallarge2512: {
          outputTokensPerSecond: 92,
          costPerTask: 0.42,
          aliases: [],
        },
      }),
    );

    expect(result?.benchmarks.intelligenceIndex).toBeUndefined();
    expect(result?.benchmarks.costPerTask).toBe(0.42);
    expect(result?.benchmarks.sources).toEqual(['artificial-analysis']);
  });

  it('returns nothing for a model no source has measured', () => {
    expect(match('mistral-large-2512', new Map(), new Map())).toBeUndefined();
  });

  it('collects the aliases both sources publish so consumers can join on them', () => {
    const result = match(
      'mistral-large-2512',
      indexOf({
        mistrallarge2512: {
          intelligenceIndex: 148.2,
          aliases: ['mistral-large-2512', 'mistralai/mistral-large-2512'],
        },
      }),
      new Map(),
    );

    expect(result?.aliases).toEqual([
      'mistral-large-2512',
      'mistralai/mistral-large-2512',
    ]);
  });
});

describe('matchBenchmarks with an empty source record', () => {
  it('returns nothing when a source matches but published no measurement', () => {
    const result = matchBenchmarks({
      modelName: 'mistral-large-2512',
      siblingModels: MISTRAL_MODELS,
      epochIndex: new Map(),
      artificialAnalysisIndex: indexOf({
        mistrallarge2512: { aliases: ['mistral-large-2512'] },
      }),
      measuredAt: MEASURED_AT,
    });

    expect(result).toBeUndefined();
  });
});
