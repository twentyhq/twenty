import { type ModelsDevData } from 'src/engine/metadata-modules/ai/ai-models/types/models-dev-data.type';

import { enrichCatalog } from '../enrich-catalog';
import { type BenchmarkIndex, type GeneratedCatalog } from '../types';

const MEASURED_AT = '2026-09-09';

const catalogOf = (...modelNames: string[]): GeneratedCatalog =>
  ({
    openai: {
      npm: '@ai-sdk/openai',
      label: 'OpenAI',
      apiKey: '',
      models: modelNames.map((name) => ({ name, label: name })),
    },
  }) as GeneratedCatalog;

const enrich = (catalog: GeneratedCatalog, benchmarkIndex: BenchmarkIndex) =>
  enrichCatalog({
    catalog,
    modelsDevData: {} as ModelsDevData,
    benchmarkIndex,
    measuredAt: MEASURED_AT,
  });

describe('enrichCatalog', () => {
  it('attaches a measurement to the model and mirrors it into the overlay', () => {
    const catalog = catalogOf('gpt-x');
    const overlay = enrich(
      catalog,
      new Map([['gptx', { intelligenceIndex: 41, aliases: ['gpt-x'] }]]),
    );

    expect(catalog.openai.models[0].benchmarks).toEqual({
      intelligenceIndex: 41,
      outputTokensPerSecond: undefined,
      timeToFirstTokenSeconds: undefined,
      costPerTask: undefined,
      measuredAt: MEASURED_AT,
    });
    expect(overlay['gpt-x'].measuredAt).toBe(MEASURED_AT);
  });

  it('does not date a price-only entry as though it were measured', () => {
    const catalog = catalogOf('gpt-x');
    const overlay = enrich(
      catalog,
      new Map([
        [
          'gptx',
          {
            observedPrices: { inputPerMillionTokens: 2 },
            aliases: ['gpt-x'],
          },
        ],
      ]),
    );

    expect(overlay['gpt-x']).not.toHaveProperty('measuredAt');
    expect(overlay['gpt-x'].artificialAnalysisPrices).toEqual({
      inputPerMillionTokens: 2,
    });
    expect(catalog.openai.models[0].benchmarks).toBeUndefined();
  });

  it('leaves a model no publisher covers untouched and out of the overlay', () => {
    const catalog = catalogOf('gpt-x');
    const overlay = enrich(catalog, new Map());

    expect(catalog.openai.models[0].benchmarks).toBeUndefined();
    expect(overlay).toEqual({});
  });

  it('keeps isDeprecated last so the generated catalog stays stable', () => {
    const catalog = catalogOf('gpt-x');

    catalog.openai.models[0].isDeprecated = true;

    enrich(
      catalog,
      new Map([['gptx', { intelligenceIndex: 41, aliases: ['gpt-x'] }]]),
    );

    expect(Object.keys(catalog.openai.models[0])).toEqual([
      'name',
      'label',
      'benchmarks',
      'isDeprecated',
    ]);
  });
});
