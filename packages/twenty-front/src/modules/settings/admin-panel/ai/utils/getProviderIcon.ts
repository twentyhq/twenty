import { type IconComponent } from 'twenty-ui/display';

import { MODEL_FAMILY_CONFIG } from '~/pages/settings/ai/constants/SettingsAiModelProviders';

const PROVIDER_TYPE_TO_FAMILY_KEY: Record<string, string> = {
  openai: 'openai',
  anthropic: 'anthropic',
  google: 'google',
  mistral: 'mistral',
  xai: 'xai',
  groq: 'openai',
  bedrock: 'anthropic',
  'openai-compatible': 'openai',
};

export const getProviderIcon = (providerType: string): IconComponent => {
  const familyKey = PROVIDER_TYPE_TO_FAMILY_KEY[providerType];

  return (
    MODEL_FAMILY_CONFIG[familyKey]?.Icon ?? MODEL_FAMILY_CONFIG.FALLBACK.Icon
  );
};

export const getProviderTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    bedrock: 'AWS Bedrock',
    google: 'Google',
    mistral: 'Mistral',
    xai: 'xAI',
    groq: 'Groq',
    'openai-compatible': 'OpenAI-Compatible',
  };

  return labels[type] ?? type;
};
