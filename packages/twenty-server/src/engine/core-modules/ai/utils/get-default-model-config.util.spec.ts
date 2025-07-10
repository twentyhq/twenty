import {
  AI_MODELS,
  DEFAULT_MODEL_ID,
  ModelProvider,
} from 'src/engine/core-modules/ai/constants/ai-models.const';

import { getDefaultModelConfig } from './get-default-model-config.util';

describe('getDefaultModelConfig', () => {
  it('should return the configuration for the default model', () => {
    const result = getDefaultModelConfig();

    expect(result).toBeDefined();
    expect(result.modelId).toBe(DEFAULT_MODEL_ID);
    expect(result.provider).toBe(ModelProvider.OPENAI);
  });

  it('should throw an error if default model is not found', () => {
    const originalFind = AI_MODELS.find;

    AI_MODELS.find = jest.fn().mockReturnValue(undefined);

    expect(() => getDefaultModelConfig()).toThrow(
      `Default model with ID ${DEFAULT_MODEL_ID} not found`,
    );

    AI_MODELS.find = originalFind;
  });
});
