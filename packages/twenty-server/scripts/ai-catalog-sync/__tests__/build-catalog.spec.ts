import { type ModelsDevData } from 'src/engine/metadata-modules/ai/ai-models/types/models-dev-data.type';

import { assertPayloadIsUsable } from '../utils/assert-payload-is-usable.util';
import { buildCatalog } from '../utils/build-catalog.util';

const languageModel = {
  id: 'model',
  name: 'Model',
  tool_call: true,
  cost: { input: 2, output: 6 },
  limit: { context: 128000, output: 8192 },
};

const VENDORS = ['openai', 'anthropic', 'google', 'xai', 'mistral'];

const payload = (): ModelsDevData => ({
  openai: { id: 'openai', models: { 'gpt-x': languageModel } },
  anthropic: { id: 'anthropic', models: { 'claude-x': languageModel } },
  google: { id: 'google', models: { 'gemini-x': languageModel } },
  xai: { id: 'xai', models: { 'grok-x': languageModel } },
  mistral: { id: 'mistral', models: { 'mistral-x': languageModel } },
});

describe('assertPayloadIsUsable', () => {
  it('accepts a payload carrying models for every vendor we ship', () => {
    expect(() =>
      assertPayloadIsUsable({ data: payload(), vendors: VENDORS }),
    ).not.toThrow();
  });

  it('refuses an empty payload rather than generating an empty catalog', () => {
    expect(() =>
      assertPayloadIsUsable({ data: {} as ModelsDevData, vendors: VENDORS }),
    ).toThrow(/refusing to overwrite the catalog/);
  });

  it('names the providers that came back empty', () => {
    const data = payload();

    data.anthropic.models = {};

    expect(() => assertPayloadIsUsable({ data, vendors: VENDORS })).toThrow(
      /anthropic/,
    );
  });
});

describe('buildCatalog', () => {
  it('prices long context from the standard output rate when none is quoted', () => {
    const data = payload();

    data.openai.models['gpt-x'].cost = {
      input: 2,
      output: 6,
      context_over_200k: { input: 4 },
    };

    const model = buildCatalog({ data, vendors: VENDORS }).openai.models[0];

    // A missing long-context rate is unknown, not free.
    expect(model.longContextCost?.outputCostPerMillionTokens).toBe(6);
  });

  it('starts long context at the threshold of the tier models.dev publishes', () => {
    const data = payload();
    const longContextRates = {
      input: 4,
      output: 9,
      cache_read: 0.4,
      cache_write: 5,
    };

    data.openai.models['gpt-x'].cost = {
      input: 2,
      output: 6,
      context_over_200k: longContextRates,
      tiers: [{ ...longContextRates, tier: { type: 'context', size: 272000 } }],
    };

    const model = buildCatalog({ data, vendors: VENDORS }).openai.models[0];

    expect(model.longContextCost).toEqual({
      inputCostPerMillionTokens: 4,
      outputCostPerMillionTokens: 9,
      thresholdTokens: 272000,
      cachedInputCostPerMillionTokens: 0.4,
      cacheCreationCostPerMillionTokens: 5,
    });
  });

  it('prices a context tier that is not quoted in context_over_200k', () => {
    const data = payload();

    data.anthropic.models['claude-x'].cost = {
      input: 0.1,
      output: 0.5,
      tiers: [
        {
          input: 0.5,
          output: 2.5,
          cache_read: 0.05,
          cache_write: 0.625,
          tier: { type: 'context', size: 100000 },
        },
      ],
    };

    const model = buildCatalog({ data, vendors: VENDORS }).anthropic.models[0];

    expect(model.longContextCost?.thresholdTokens).toBe(100000);
    expect(model.longContextCost?.inputCostPerMillionTokens).toBe(0.5);
  });
});
