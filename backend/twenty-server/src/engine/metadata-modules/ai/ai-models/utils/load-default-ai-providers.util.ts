import { type AiProviderModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-model-config.type';
import { type AiProvidersConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers-config.type';

import defaultAiProviders from '../ai-providers.json';

export const loadDefaultAiProviders = (): AiProvidersConfig => {
  const raw = defaultAiProviders as unknown as AiProvidersConfig;
  const result: AiProvidersConfig = {};

  for (const [key, config] of Object.entries(raw)) {
    result[key] = {
      ...config,
      name: key,
      models: (config.models ?? []).map(
        (model): AiProviderModelConfig => ({ ...model, source: 'catalog' }),
      ),
    };
  }

  return result;
};
