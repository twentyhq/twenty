import {
  DEFAULT_MODEL_ID,
  ModelProvider,
} from 'src/engine/core-modules/ai/constants/ai-models.const';

import { getEffectiveModelConfig } from './get-effective-model-config.util';

describe('getEffectiveModelConfig', () => {
  it('should return default model config when modelId is "auto"', () => {
    const result = getEffectiveModelConfig('auto');

    expect(result).toBeDefined();
    expect(result.modelId).toBe(DEFAULT_MODEL_ID);
    expect(result.provider).toBe(ModelProvider.OPENAI);
  });

  it('should return the correct model config for a specific model', () => {
    const result = getEffectiveModelConfig('gpt-4o');

    expect(result).toBeDefined();
    expect(result.modelId).toBe('gpt-4o');
    expect(result.provider).toBe(ModelProvider.OPENAI);
  });

  it('should throw an error for non-existent model', () => {
    expect(() => getEffectiveModelConfig('non-existent-model' as any)).toThrow(
      `Model with ID non-existent-model not found`,
    );
  });
});
