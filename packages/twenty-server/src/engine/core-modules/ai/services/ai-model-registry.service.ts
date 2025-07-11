import { Injectable } from '@nestjs/common';

import { anthropic } from '@ai-sdk/anthropic';
import { createOpenAI, openai } from '@ai-sdk/openai';
import { LanguageModel } from 'ai';

import {
  AI_MODELS,
  AIModelConfig,
  ModelProvider,
} from 'src/engine/core-modules/ai/constants/ai-models.const';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export interface RegisteredAIModel {
  modelId: string;
  provider: ModelProvider;
  model: LanguageModel;
}

@Injectable()
export class AiModelRegistryService {
  private modelRegistry: Map<string, RegisteredAIModel> = new Map();

  constructor(private twentyConfigService: TwentyConfigService) {
    this.buildModelRegistry();
  }

  private buildModelRegistry(): void {
    this.modelRegistry.clear();

    const openaiApiKey = this.twentyConfigService.get('OPENAI_API_KEY');

    if (openaiApiKey) {
      this.registerOpenAIModels();
    }

    const anthropicApiKey = this.twentyConfigService.get('ANTHROPIC_API_KEY');

    if (anthropicApiKey) {
      this.registerAnthropicModels();
    }

    const openaiCompatibleBaseUrl = this.twentyConfigService.get(
      'OPENAI_COMPATIBLE_BASE_URL',
    );
    const openaiCompatibleModelNames = this.twentyConfigService.get(
      'OPENAI_COMPATIBLE_MODEL_NAMES',
    );

    if (openaiCompatibleBaseUrl && openaiCompatibleModelNames) {
      this.registerOpenAICompatibleModels(
        openaiCompatibleBaseUrl,
        openaiCompatibleModelNames,
      );
    }
  }

  private registerOpenAIModels(): void {
    const openaiModels = AI_MODELS.filter(
      (model) => model.provider === ModelProvider.OPENAI,
    );

    openaiModels.forEach((modelConfig) => {
      this.modelRegistry.set(modelConfig.modelId, {
        modelId: modelConfig.modelId,
        provider: ModelProvider.OPENAI,
        model: openai(modelConfig.modelId),
      });
    });
  }

  private registerAnthropicModels(): void {
    const anthropicModels = AI_MODELS.filter(
      (model) => model.provider === ModelProvider.ANTHROPIC,
    );

    anthropicModels.forEach((modelConfig) => {
      this.modelRegistry.set(modelConfig.modelId, {
        modelId: modelConfig.modelId,
        provider: ModelProvider.ANTHROPIC,
        model: anthropic(modelConfig.modelId),
      });
    });
  }

  private registerOpenAICompatibleModels(
    baseUrl: string,
    modelNamesString: string,
  ): void {
    const apiKey = this.twentyConfigService.get('OPENAI_COMPATIBLE_API_KEY');
    const provider = createOpenAI({
      baseURL: baseUrl,
      apiKey: apiKey,
    });

    const modelNames = modelNamesString
      .split(',')
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    modelNames.forEach((modelId) => {
      this.modelRegistry.set(modelId, {
        modelId,
        provider: ModelProvider.OPENAI_COMPATIBLE,
        model: provider(modelId),
      });
    });
  }

  getModel(modelId: string): RegisteredAIModel | undefined {
    return this.modelRegistry.get(modelId);
  }

  getAvailableModels(): RegisteredAIModel[] {
    return Array.from(this.modelRegistry.values());
  }

  getDefaultModel(): RegisteredAIModel | undefined {
    const defaultModelId = this.twentyConfigService.get('DEFAULT_MODEL_ID');
    let model = this.getModel(defaultModelId);

    if (!model) {
      const availableModels = this.getAvailableModels();

      model = availableModels[0];
    }

    return model;
  }

  getEffectiveModelConfig(modelId: string): AIModelConfig {
    if (modelId === 'auto') {
      const defaultModel = this.getDefaultModel();

      if (!defaultModel) {
        throw new Error(
          'No AI models are available. Please configure at least one provider.',
        );
      }

      const modelConfig = AI_MODELS.find(
        (model) => model.modelId === defaultModel.modelId,
      );

      if (modelConfig) {
        return modelConfig;
      }

      return this.createDefaultConfigForCustomModel(defaultModel);
    }

    const predefinedModel = AI_MODELS.find(
      (model) => model.modelId === modelId,
    );

    if (predefinedModel) {
      return predefinedModel;
    }

    const registeredModel = this.getModel(modelId);

    if (registeredModel) {
      return this.createDefaultConfigForCustomModel(registeredModel);
    }

    throw new Error(`Model with ID ${modelId} not found`);
  }

  private createDefaultConfigForCustomModel(
    registeredModel: RegisteredAIModel,
  ): AIModelConfig {
    return {
      modelId: registeredModel.modelId,
      label: registeredModel.modelId,
      provider: registeredModel.provider,
      inputCostPer1kTokensInCents: 0,
      outputCostPer1kTokensInCents: 0,
    };
  }

  // Force refresh the registry (useful if config changes)
  refreshRegistry(): void {
    this.buildModelRegistry();
  }
}
