import { Injectable } from '@nestjs/common';

import { LanguageModel, type ModelMessage, streamText } from 'ai';

import { AiModelRegistryService } from 'src/engine/core-modules/ai/services/ai-model-registry.service';

@Injectable()
export class AiService {
  constructor(private aiModelRegistryService: AiModelRegistryService) {}

  getModel(modelId: string | undefined) {
    const registeredModel = modelId
      ? this.aiModelRegistryService.getModel(modelId)
      : this.aiModelRegistryService.getDefaultModel();

    if (!registeredModel) {
      throw new Error(
        modelId
          ? `Model "${modelId}" is not available. Please check your configuration.`
          : 'No AI models are available. Please configure at least one provider.',
      );
    }

    return registeredModel.model;
  }

  streamText({
    messages,
    options,
  }: {
    messages: ModelMessage[];
    options: {
      temperature?: number;
      maxOutputTokens?: number;
      model: LanguageModel;
    };
  }) {
    return streamText({
      model: options.model,
      messages,
      temperature: options?.temperature,
      maxOutputTokens: options?.maxOutputTokens,
    });
  }
}
