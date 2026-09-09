import { type ModelsDevData } from 'src/engine/metadata-modules/ai/ai-models/types/models-dev-data.type';

import { assertPayloadIsUsable, buildCatalog } from '../build-catalog';

const languageModel = {
  id: 'model',
  name: 'Model',
  tool_call: true,
  cost: { input: 2, output: 6 },
  limit: { context: 128000, output: 8192 },
};

const payload = (): ModelsDevData =>
  ({
    openai: { id: 'openai', models: { 'gpt-x': languageModel } },
    anthropic: { id: 'anthropic', models: { 'claude-x': languageModel } },
    google: { id: 'google', models: { 'gemini-x': languageModel } },
    xai: { id: 'xai', models: { 'grok-x': languageModel } },
    mistral: { id: 'mistral', models: { 'mistral-x': languageModel } },
  }) as unknown as ModelsDevData;

describe('assertPayloadIsUsable', () => {
  it('accepts a payload carrying models for every native provider', () => {
    expect(() => assertPayloadIsUsable(payload())).not.toThrow();
  });

  it('refuses an empty payload rather than generating an empty catalog', () => {
    expect(() => assertPayloadIsUsable({} as ModelsDevData)).toThrow(
      /refusing to overwrite the catalog/,
    );
  });

  it('names the providers that came back empty', () => {
    const data = payload();

    data.anthropic.models = {};

    expect(() => assertPayloadIsUsable(data)).toThrow(/anthropic/);
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

    const model = buildCatalog(data).openai.models[0];

    // A missing long-context rate is unknown, not free.
    expect(model.longContextCost?.outputCostPerMillionTokens).toBe(6);
  });
});
