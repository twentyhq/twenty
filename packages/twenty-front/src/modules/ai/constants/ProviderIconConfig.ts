import {
  IconBrandAnthropic,
  IconBrandMistral,
  IconBrandTypesafeAi,
  IconBrandXai,
  IconGoogle,
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
  // models.dev has no logo for evaluation-only providers and the fallback renders a broken image.
  'typesafe-ai': { Icon: IconBrandTypesafeAi },
};
