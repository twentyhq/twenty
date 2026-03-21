import {
  IconBrandAnthropic,
  IconBrandGroq,
  IconBrandMistral,
  IconBrandXai,
  IconGoogle,
  IconProviderOpenai,
  IconRobot,
  type IconComponent,
} from 'twenty-ui/display';

import { type KnownProviderId } from '@/settings/admin-panel/ai/utils/isKnownProviderId';

export const PROVIDER_CONFIG: Record<
  KnownProviderId,
  { label: string; Icon: IconComponent }
> = {
  openai: { label: 'OpenAI', Icon: IconProviderOpenai },
  anthropic: { label: 'Anthropic', Icon: IconBrandAnthropic },
  bedrock: { label: 'AWS Bedrock', Icon: IconRobot },
  google: { label: 'Google', Icon: IconGoogle },
  mistral: { label: 'Mistral', Icon: IconBrandMistral },
  xai: { label: 'xAI', Icon: IconBrandXai },
  groq: { label: 'Groq', Icon: IconBrandGroq },
  'openai-compatible': { label: 'OpenAI-Compatible', Icon: IconProviderOpenai },
};
