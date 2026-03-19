import { IconRobot, type IconComponent } from 'twenty-ui/display';

import { PROVIDER_ICON_CONFIG } from '@/settings/admin-panel/ai/constants/SettingsAiModelProviders';

export const getProviderIcon = (providerType: string): IconComponent => {
  return PROVIDER_ICON_CONFIG[providerType] ?? IconRobot;
};

export const PROVIDER_TYPE_LABELS: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  bedrock: 'AWS Bedrock',
  google: 'Google',
  mistral: 'Mistral',
  xai: 'xAI',
  groq: 'Groq',
  'openai-compatible': 'OpenAI-Compatible',
};

export const getProviderTypeLabel = (type: string): string =>
  PROVIDER_TYPE_LABELS[type] ?? type;
