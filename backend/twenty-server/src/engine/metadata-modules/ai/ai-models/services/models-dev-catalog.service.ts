import { Injectable, Logger } from '@nestjs/common';

import { inferAiSdkPackage } from 'twenty-shared/ai';

import { MODELS_DEV_API_URL } from 'src/engine/metadata-modules/ai/ai-models/constants/models-dev.const';
import { type ModelsDevData } from 'src/engine/metadata-modules/ai/ai-models/types/models-dev-data.type';

export type ModelsDevModelSuggestion = {
  // models.dev catalog key for the model (often a bare id). Not the composite `provider/modelName` workspace id used in the registry.
  modelId: string;
  // Display name from the catalog (`model.name`), or the catalog key when absent.
  name: string;
  inputCostPerMillionTokens: number;
  outputCostPerMillionTokens: number;
  cachedInputCostPerMillionTokens?: number;
  cacheCreationCostPerMillionTokens?: number;
  contextWindowTokens: number;
  maxOutputTokens: number;
  modalities: string[];
  supportsReasoning: boolean;
};

export type ModelsDevProviderSuggestion = {
  id: string;
  modelCount: number;
  npm: string;
};

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const NON_LANGUAGE_PATTERNS = [
  'embed',
  'tts',
  'whisper',
  'dall-e',
  'moderation',
  'text-to-speech',
  'speech-to-text',
  'imagen',
  'aqa',
];

@Injectable()
export class ModelsDevCatalogService {
  private readonly logger = new Logger(ModelsDevCatalogService.name);
  private cache: ModelsDevData | null = null;
  private cacheTimestamp = 0;

  async getProviderSuggestions(): Promise<ModelsDevProviderSuggestion[]> {
    const data = await this.getCachedData();

    if (!data) {
      return [];
    }

    return Object.entries(data)
      .filter(([, provider]) => {
        const models = Object.keys(provider.models ?? {});

        return models.some((modelId) => this.isLanguageModel(modelId));
      })
      .map(([id, provider]) => ({
        id,
        modelCount: Object.keys(provider.models ?? {}).filter((modelId) =>
          this.isLanguageModel(modelId),
        ).length,
        npm: inferAiSdkPackage(id),
      }))
      .sort((a, b) => b.modelCount - a.modelCount);
  }

  async getModelSuggestions(
    providerType: string,
  ): Promise<ModelsDevModelSuggestion[]> {
    const data = await this.getCachedData();

    if (!data) {
      return [];
    }

    const providerData = data[providerType];

    if (!providerData?.models) {
      return [];
    }

    return Object.entries(providerData.models)
      .filter(([modelId]) => this.isLanguageModel(modelId))
      .map(([modelId, model]) => ({
        modelId,
        name: model.name ?? modelId,
        inputCostPerMillionTokens: model.cost?.input ?? 0,
        outputCostPerMillionTokens: model.cost?.output ?? 0,
        cachedInputCostPerMillionTokens: model.cost?.cache_read,
        cacheCreationCostPerMillionTokens: model.cost?.cache_write,
        contextWindowTokens: model.limit?.context ?? 0,
        maxOutputTokens: model.limit?.output ?? 0,
        modalities: (model.modalities?.input ?? []).filter(
          (modality) => modality !== 'text',
        ),
        supportsReasoning: model.reasoning ?? false,
      }));
  }

  private async getCachedData(): Promise<ModelsDevData | null> {
    const now = Date.now();

    if (this.cache && now - this.cacheTimestamp < CACHE_TTL_MS) {
      return this.cache;
    }

    try {
      const response = await fetch(MODELS_DEV_API_URL, {
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        this.logger.warn(
          `models.dev API returned ${response.status}, using cached data`,
        );

        return this.cache;
      }

      this.cache = await response.json();
      this.cacheTimestamp = now;

      return this.cache;
    } catch (error) {
      this.logger.warn(
        `Failed to fetch models.dev: ${error instanceof Error ? error.message : String(error)}`,
      );

      return this.cache;
    }
  }

  private isLanguageModel(modelId: string): boolean {
    const id = modelId.toLowerCase();

    return !NON_LANGUAGE_PATTERNS.some((pattern) => id.includes(pattern));
  }
}
