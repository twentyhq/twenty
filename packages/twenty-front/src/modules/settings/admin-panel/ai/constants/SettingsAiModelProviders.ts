import {
  IconBrandAnthropic,
  IconBrandGemini,
  IconBrandGroq,
  IconBrandMistral,
  IconBrandXai,
  IconGoogle,
  IconModelClaude,
  IconProviderOpenai,
  IconRobot,
  type IconComponent,
} from 'twenty-ui/display';

// Model icons: used in model pickers, hover cards, and model lists.
// Keyed by modelFamily. These represent the model brand, not the provider.
export const MODEL_ICON_CONFIG: Record<
  string,
  { label: string; Icon: IconComponent }
> = {
  openai: { label: 'GPT', Icon: IconProviderOpenai },
  anthropic: { label: 'Claude', Icon: IconModelClaude },
  google: { label: 'Gemini', Icon: IconBrandGemini },
  groq: { label: 'Groq', Icon: IconBrandGroq },
  mistral: { label: 'Mistral', Icon: IconBrandMistral },
  xai: { label: 'Grok', Icon: IconBrandXai },
  FALLBACK: { label: '', Icon: IconRobot },
};

// Provider icons: used in the admin panel provider list.
// Keyed by provider type. These represent the company/service.
export const PROVIDER_ICON_CONFIG: Record<string, IconComponent> = {
  openai: IconProviderOpenai,
  anthropic: IconBrandAnthropic,
  google: IconGoogle,
  groq: IconBrandGroq,
  mistral: IconBrandMistral,
  xai: IconBrandXai,
  bedrock: IconRobot,
  'openai-compatible': IconProviderOpenai,
};
