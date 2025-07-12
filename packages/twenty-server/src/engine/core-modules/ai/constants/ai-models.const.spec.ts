import { Test, TestingModule } from '@nestjs/testing';

import { AiModelRegistryService } from 'src/engine/core-modules/ai/services/ai-model-registry.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

import { AI_MODELS, ModelProvider } from './ai-models.const';

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
});

describe('AiModelRegistryService', () => {
  let SERVICE: AiModelRegistryService;
  let MOCK_CONFIG_SERVICE: jest.Mocked<TwentyConfigService>;

  beforeEach(async () => {
    MOCK_CONFIG_SERVICE = {
      get: jest.fn(),
    } as any;

    const MODULE: TestingModule = await Test.createTestingModule({
      providers: [
        AiModelRegistryService,
        {
          provide: TwentyConfigService,
          useValue: MOCK_CONFIG_SERVICE,
        },
      ],
    }).compile();

    SERVICE = MODULE.get<AiModelRegistryService>(AiModelRegistryService);
  });

  it('should return effective model config for auto', () => {
    MOCK_CONFIG_SERVICE.get.mockReturnValue('gpt-4o');

    expect(() => SERVICE.getEffectiveModelConfig('auto')).toThrow(
      'No AI models are available. Please configure at least one provider.',
    );
  });

  it('should return effective model config for auto when models are available', () => {
    MOCK_CONFIG_SERVICE.get.mockReturnValue('gpt-4o');

    jest.spyOn(SERVICE, 'getAvailableModels').mockReturnValue([
      {
        modelId: 'gpt-4o',
        provider: ModelProvider.OPENAI,
        model: {} as any,
      },
    ]);

    jest.spyOn(SERVICE, 'getModel').mockReturnValue({
      modelId: 'gpt-4o',
      provider: ModelProvider.OPENAI,
      model: {} as any,
    });

    const RESULT = SERVICE.getEffectiveModelConfig('auto');

    expect(RESULT).toBeDefined();
    expect(RESULT.modelId).toBe('gpt-4o');
    expect(RESULT.provider).toBe(ModelProvider.OPENAI);
  });

  it('should return effective model config for auto with custom model', () => {
    MOCK_CONFIG_SERVICE.get.mockReturnValue('mistral');

    jest.spyOn(SERVICE, 'getAvailableModels').mockReturnValue([
      {
        modelId: 'mistral',
        provider: ModelProvider.OPENAI_COMPATIBLE,
        model: {} as any,
      },
    ]);

    jest.spyOn(SERVICE, 'getModel').mockReturnValue({
      modelId: 'mistral',
      provider: ModelProvider.OPENAI_COMPATIBLE,
      model: {} as any,
    });

    const RESULT = SERVICE.getEffectiveModelConfig('auto');

    expect(RESULT).toBeDefined();
    expect(RESULT.modelId).toBe('mistral');
    expect(RESULT.provider).toBe(ModelProvider.OPENAI_COMPATIBLE);
    expect(RESULT.label).toBe('mistral');
    expect(RESULT.inputCostPer1kTokensInCents).toBe(0);
    expect(RESULT.outputCostPer1kTokensInCents).toBe(0);
  });

  it('should return effective model config for specific model', () => {
    const RESULT = SERVICE.getEffectiveModelConfig('gpt-4o-mini');

    expect(RESULT).toBeDefined();
    expect(RESULT.modelId).toBe('gpt-4o-mini');
    expect(RESULT.provider).toBe(ModelProvider.OPENAI);
  });

  it('should return effective model config for custom model', () => {
    // Mock that the custom model exists in registry
    jest.spyOn(SERVICE, 'getModel').mockReturnValue({
      modelId: 'mistral',
      provider: ModelProvider.OPENAI_COMPATIBLE,
      model: {} as any,
    });

    const RESULT = SERVICE.getEffectiveModelConfig('mistral');

    expect(RESULT).toBeDefined();
    expect(RESULT.modelId).toBe('mistral');
    expect(RESULT.provider).toBe(ModelProvider.OPENAI_COMPATIBLE);
    expect(RESULT.label).toBe('mistral');
    expect(RESULT.inputCostPer1kTokensInCents).toBe(0);
    expect(RESULT.outputCostPer1kTokensInCents).toBe(0);
  });

  it('should throw error for non-existent model', () => {
    jest.spyOn(SERVICE, 'getModel').mockReturnValue(undefined);

    expect(() => SERVICE.getEffectiveModelConfig('non-existent-model')).toThrow(
      'Model with ID non-existent-model not found',
    );
  });
});
