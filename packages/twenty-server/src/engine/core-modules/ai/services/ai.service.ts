import { Injectable } from '@nestjs/common';

import { type CoreMessage, streamText, LanguageModelV1 } from 'ai';

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

  streamText(
    messages: CoreMessage[],
    options: {
      temperature?: number;
      maxTokens?: number;
      model: LanguageModelV1;
    },
  ) {
    return streamText({
      model: options.model,
      messages,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
    });
  }
}
