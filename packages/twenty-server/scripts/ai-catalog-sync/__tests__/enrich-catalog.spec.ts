import { type ModelsDevData } from 'src/engine/metadata-modules/ai/ai-models/types/models-dev-data.type';

import { enrichCatalog } from '../utils/enrich-catalog.util';
import { type BenchmarkIndex } from '../types/benchmark-index.type';
import { type GeneratedCatalog } from '../types/generated-catalog.type';

const MEASURED_AT = '2026-09-09';

const catalogOf = (...modelNames: string[]): GeneratedCatalog => ({
  openai: { models: modelNames.map((name) => ({ name, label: name })) },
});

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

    expect(catalog.openai.models[0].benchmark).toEqual({
      intelligenceIndex: 41,
      outputTokensPerSecond: undefined,
      costPerTask: undefined,
      measuredAt: MEASURED_AT,
    });
    expect(overlay['gpt-x'].measuredAt).toBe(MEASURED_AT);
  });

  it('leaves a row the publisher measured nothing about out of both artifacts', () => {
    const catalog = catalogOf('gpt-x');
    const overlay = enrich(
      catalog,
      new Map([['gptx', { aliases: ['gpt-x'] }]]),
    );

    expect(overlay).toEqual({});
    expect(catalog.openai.models[0].benchmark).toBeUndefined();
  });

  it('leaves a model no publisher covers untouched and out of the overlay', () => {
    const catalog = catalogOf('gpt-x');
    const overlay = enrich(catalog, new Map());

    expect(catalog.openai.models[0].benchmark).toBeUndefined();
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
      'benchmark',
      'isDeprecated',
    ]);
  });

  it('embeds per-effort readings in the catalog and mirrors them, with aliases, into the overlay', () => {
    const catalog = catalogOf('gpt-x');

    catalog.openai.models[0].efforts = ['low', 'high'];

    const overlay = enrich(
      catalog,
      new Map([
        [
          'gptx',
          { intelligenceIndex: 41, effort: 'high', aliases: ['GPT X (high)'] },
        ],
        [
          'gptx@high',
          { intelligenceIndex: 41, effort: 'high', aliases: ['GPT X (high)'] },
        ],
        [
          'gptx@low',
          { intelligenceIndex: 30, effort: 'low', aliases: ['GPT X (low)'] },
        ],
      ]),
    );

    expect(catalog.openai.models[0].benchmark?.effort).toBe('high');
    expect(catalog.openai.models[0].benchmarkByEffort).toEqual({
      low: { intelligenceIndex: 30, effort: 'low', measuredAt: MEASURED_AT },
      high: { intelligenceIndex: 41, effort: 'high', measuredAt: MEASURED_AT },
    });
    expect(overlay['gpt-x'].benchmarkByEffort?.low).toEqual({
      intelligenceIndex: 30,
      effort: 'low',
      measuredAt: MEASURED_AT,
      aliases: ['GPT X (low)'],
    });
    expect(Object.keys(catalog.openai.models[0])).toEqual([
      'name',
      'label',
      'efforts',
      'benchmark',
      'benchmarkByEffort',
    ]);
  });

  it('writes no effort map for a model whose declared efforts have no rows', () => {
    const catalog = catalogOf('gpt-x');

    catalog.openai.models[0].efforts = ['low', 'high'];

    const overlay = enrich(
      catalog,
      new Map([['gptx', { intelligenceIndex: 41, aliases: ['gpt-x'] }]]),
    );

    expect(catalog.openai.models[0].benchmarkByEffort).toBeUndefined();
    expect(overlay['gpt-x'].benchmarkByEffort).toBeUndefined();
  });
});
