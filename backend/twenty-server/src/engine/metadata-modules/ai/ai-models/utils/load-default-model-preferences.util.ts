// TODO: derive default model preferences dynamically from the catalog
// instead of hardcoding model IDs that become stale as models evolve
import { type AiModelPreferences } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-preferences.type';

const DEFAULT_FAST_MODELS = [
  'openai/gpt-5-mini',
  'anthropic/claude-haiku-4-5-20251001',
  'google/gemini-3-flash-preview',
  'xai/grok-4-1-fast',
  'mistral/mistral-large-latest',
];

const DEFAULT_SMART_MODELS = [
  'openai/gpt-5.2',
  'anthropic/claude-sonnet-4-6',
  'google/gemini-3.1-pro-preview',
  'xai/grok-4',
  'mistral/mistral-large-latest',
];

const DEFAULT_RECOMMENDED_MODELS = [
  'openai/gpt-5.2',
  'openai/gpt-4.1',
  'anthropic/claude-opus-4-6',
  'anthropic/claude-sonnet-4-6',
  'google/gemini-3.1-pro-preview',
  'xai/grok-4',
];

export const loadDefaultModelPreferences = (): AiModelPreferences => {
  return {
    disabledModels: [],
    recommendedModels: DEFAULT_RECOMMENDED_MODELS,
    defaultFastModels: DEFAULT_FAST_MODELS,
    defaultSmartModels: DEFAULT_SMART_MODELS,
  };
};
