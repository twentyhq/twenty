import { IconRobot, type IconComponent } from 'twenty-ui/display';

import { PROVIDER_ICON_CONFIG } from '~/pages/settings/ai/constants/SettingsAiModelProviders';

export const getProviderIcon = (providerType: string): IconComponent => {
  return PROVIDER_ICON_CONFIG[providerType] ?? IconRobot;
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
