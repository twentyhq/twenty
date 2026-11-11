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

  it('prices long context dynamically from tiers when present', () => {
    const data = payload();

    data.openai.models['gpt-x'].cost = {
      input: 2,
      output: 6,
      tiers: [
        {
          input: 3.5,
          output: 10.5,
          tier: { type: 'context', size: 100000 },
        },
      ],
    };

    const model = buildCatalog({ data, vendors: VENDORS }).openai.models[0];

    expect(model.longContextCost).toEqual({
      inputCostPerMillionTokens: 3.5,
      outputCostPerMillionTokens: 10.5,
      thresholdTokens: 100000,
      cachedInputCostPerMillionTokens: undefined,
      cacheCreationCostPerMillionTokens: undefined,
    });
  });

  it('prefers tiers over legacy context_over_200k pricing', () => {
    const data = payload();

    data.openai.models['gpt-x'].cost = {
      input: 2,
      output: 6,
      context_over_200k: { input: 4, output: 12 },
      tiers: [
        {
          input: 5,
          output: 15,
          tier: { type: 'context', size: 128000 },
        },
      ],
    };

    const model = buildCatalog({ data, vendors: VENDORS }).openai.models[0];

    expect(model.longContextCost?.thresholdTokens).toBe(128000);
    expect(model.longContextCost?.inputCostPerMillionTokens).toBe(5);
    expect(model.longContextCost?.outputCostPerMillionTokens).toBe(15);
  });

  it('falls back to context_over_200k when tiers contain no usable entries', () => {
    const data = payload();

    data.openai.models['gpt-x'].cost = {
      input: 2,
      output: 6,
      context_over_200k: { input: 4, output: 12 },
      tiers: [
        {
          tier: { type: 'context', size: 128000 },
        },
      ],
    };

    const model = buildCatalog({ data, vendors: VENDORS }).openai.models[0];

    expect(model.longContextCost?.thresholdTokens).toBe(200000);
    expect(model.longContextCost?.inputCostPerMillionTokens).toBe(4);
    expect(model.longContextCost?.outputCostPerMillionTokens).toBe(12);
  });
});
