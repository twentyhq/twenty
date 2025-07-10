import { getAIModelsWithAuto } from 'src/engine/core-modules/ai/utils/get-ai-models-with-auto.util';
import { getDefaultModelConfig } from 'src/engine/core-modules/ai/utils/get-default-model-config.util';

import { AI_MODELS, DEFAULT_MODEL_ID, ModelProvider } from './ai-models.const';

describe('AI_MODELS', () => {
  it('should contain all expected models', () => {
    expect(AI_MODELS).toHaveLength(6);
    expect(AI_MODELS.map((model) => model.modelId)).toEqual([
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'claude-opus-4-20250514',
      'claude-sonnet-4-20250514',
      'claude-3-5-haiku-20241022',
    ]);
  });

  it('should have the default model as the first model', () => {
    const DEFAULT_MODEL = AI_MODELS.find(
      (model) => model.modelId === DEFAULT_MODEL_ID,
    );

    expect(DEFAULT_MODEL).toBeDefined();
    expect(DEFAULT_MODEL?.modelId).toBe(DEFAULT_MODEL_ID);
  });
});

describe('getAIModelsWithAuto', () => {
  it('should return AI_MODELS with auto model prepended', () => {
    const ORIGINAL_MODELS = AI_MODELS;
    const MODELS_WITH_AUTO = getAIModelsWithAuto();

    expect(MODELS_WITH_AUTO).toHaveLength(ORIGINAL_MODELS.length + 1);
    expect(MODELS_WITH_AUTO[0].modelId).toBe('auto');
    expect(MODELS_WITH_AUTO[0].label).toBe('Auto');
    expect(MODELS_WITH_AUTO[0].provider).toBe(ModelProvider.NONE);

    // Check that the rest of the models are the same
    expect(MODELS_WITH_AUTO.slice(1)).toEqual(ORIGINAL_MODELS);
  });

  it('should have auto model with default model costs', () => {
    const MODELS_WITH_AUTO = getAIModelsWithAuto();
    const AUTO_MODEL = MODELS_WITH_AUTO[0];
    const DEFAULT_MODEL = getDefaultModelConfig();

    expect(AUTO_MODEL.inputCostPer1kTokensInCents).toBe(
      DEFAULT_MODEL.inputCostPer1kTokensInCents,
    );
    expect(AUTO_MODEL.outputCostPer1kTokensInCents).toBe(
      DEFAULT_MODEL.outputCostPer1kTokensInCents,
    );
  });
});
