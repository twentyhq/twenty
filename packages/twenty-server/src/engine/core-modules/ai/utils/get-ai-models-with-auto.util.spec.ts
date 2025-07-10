import {
  AI_MODELS,
  ModelProvider,
} from 'src/engine/core-modules/ai/constants/ai-models.const';

import { getAIModelsWithAuto } from './get-ai-models-with-auto.util';
import { getDefaultModelConfig } from './get-default-model-config.util';

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
