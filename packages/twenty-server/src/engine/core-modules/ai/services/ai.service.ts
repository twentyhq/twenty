import { Injectable } from '@nestjs/common';

import { CoreMessage, StreamTextResult, streamText } from 'ai';

import { AiModelRegistryService } from 'src/engine/core-modules/ai/services/ai-model-registry.service';

@Injectable()
export class AiService {
  constructor(private aiModelRegistryService: AiModelRegistryService) {}

  streamText(
    messages: CoreMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      modelId?: string; // Optional model override
    },
  ): StreamTextResult<Record<string, never>, undefined> {
    const modelId = options?.modelId;
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

    return streamText({
      model: registeredModel.model,
      messages,
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
    });
  }

  getAvailableModels() {
    return this.aiModelRegistryService.getAvailableModels();
  }

  getDefaultModel() {
    return this.aiModelRegistryService.getDefaultModel();
  }
}
