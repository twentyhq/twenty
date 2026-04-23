import {
  IconBrandAnthropic,
  IconBrandMistral,
  IconBrandXai,
  IconGoogle,
  IconProviderOpenai,
  IconRobot,
  type IconComponent,
} from 'twenty-ui/display';

export const PROVIDER_ICON_CONFIG: Record<string, { Icon: IconComponent }> = {
  openai: { Icon: IconProviderOpenai },
  anthropic: { Icon: IconBrandAnthropic },
  bedrock: { Icon: IconRobot },
  google: { Icon: IconGoogle },
  mistral: { Icon: IconBrandMistral },
  xai: { Icon: IconBrandXai },
  'openai-compatible': { Icon: IconProviderOpenai },
};
