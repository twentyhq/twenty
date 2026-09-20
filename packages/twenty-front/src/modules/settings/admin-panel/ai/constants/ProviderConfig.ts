import {
  IconBrandAnthropic,
  IconBrandMistral,
  IconBrandXai,
  IconGoogle,
  IconListCheck,
  IconProviderOpenai,
  IconRobot,
  type IconComponent,
} from 'twenty-ui/icon';

export const PROVIDER_ICON_CONFIG: Record<string, { Icon: IconComponent }> = {
  openai: { Icon: IconProviderOpenai },
  anthropic: { Icon: IconBrandAnthropic },
  bedrock: { Icon: IconRobot },
  google: { Icon: IconGoogle },
  mistral: { Icon: IconBrandMistral },
  xai: { Icon: IconBrandXai },
  'openai-compatible': { Icon: IconProviderOpenai },
  // models.dev serves no logo for an evaluation-only provider, and the fallback
  // renders a broken image rather than nothing.
  'typesafe-ai': { Icon: IconListCheck },
};
