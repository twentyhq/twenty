import {
    AI_MODELS,
    AI_MODELS_WITH_AUTO,
    DEFAULT_MODEL_ID,
    getDefaultModelConfig,
    getEffectiveModelConfig,
    ModelProvider,
} from './ai-models.const';

describe('AI Models Constants', () => {
  describe('DEFAULT_MODEL_ID', () => {
    it('should be defined', () => {
      expect(DEFAULT_MODEL_ID).toBeDefined();
      expect(DEFAULT_MODEL_ID).toBe('gpt-4o');
    });
  });

  describe('getDefaultModelConfig', () => {
    it('should return the configuration for the default model', () => {
      const defaultConfig = getDefaultModelConfig();
      
      expect(defaultConfig).toBeDefined();
      expect(defaultConfig.modelId).toBe(DEFAULT_MODEL_ID);
      expect(defaultConfig.provider).toBe(ModelProvider.OPENAI);
    });

    it('should throw an error if default model is not found', () => {
      // This would only happen if the constants are misconfigured
      const originalFind = AI_MODELS.find;
      AI_MODELS.find = jest.fn().mockReturnValue(undefined);
      
      expect(() => getDefaultModelConfig()).toThrow(`Default model '${DEFAULT_MODEL_ID}' not found in AI_MODELS`);
      
      // Restore the original find method
      AI_MODELS.find = originalFind;
    });
  });

  describe('getEffectiveModelConfig', () => {
    it('should return default model config when modelId is "auto"', () => {
      const effectiveConfig = getEffectiveModelConfig('auto');
      const defaultConfig = getDefaultModelConfig();
      
      expect(effectiveConfig).toEqual(defaultConfig);
    });

    it('should return the correct model config for a specific model', () => {
      const effectiveConfig = getEffectiveModelConfig('gpt-4o');
      
      expect(effectiveConfig).toBeDefined();
      expect(effectiveConfig.modelId).toBe('gpt-4o');
      expect(effectiveConfig.provider).toBe(ModelProvider.OPENAI);
    });

    it('should throw an error for non-existent model', () => {
      expect(() => getEffectiveModelConfig('non-existent-model' as any)).toThrow(`Model 'non-existent-model' not found in AI_MODELS`);
    });
  });

  describe('AI_MODELS_WITH_AUTO', () => {
    it('should include auto model as the first entry', () => {
      expect(AI_MODELS_WITH_AUTO[0]).toEqual({
        modelId: 'auto',
        label: 'Auto',
        provider: ModelProvider.NONE,
        inputCostPer1kTokensInCents: getDefaultModelConfig().inputCostPer1kTokensInCents,
        outputCostPer1kTokensInCents: getDefaultModelConfig().outputCostPer1kTokensInCents,
      });
    });

    it('should include all original AI models', () => {
      const originalModels = AI_MODELS_WITH_AUTO.slice(1); // Skip the auto model
      
      expect(originalModels).toHaveLength(AI_MODELS.length);
      // Each model in originalModels should be found in AI_MODELS
      originalModels.forEach((model, index) => {
        expect(model).toEqual(AI_MODELS[index]);
      });
    });

    it('should have the correct total length', () => {
      expect(AI_MODELS_WITH_AUTO).toHaveLength(AI_MODELS.length + 1);
    });
  });
}); 