import {
  IconBrandAnthropic,
  IconBrandGemini,
  IconBrandGroq,
  IconBrandMistral,
  IconBrandXai,
  IconGoogle,
  IconProviderOpenai,
  IconRobot,
  type IconComponent,
} from 'twenty-ui/display';

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
