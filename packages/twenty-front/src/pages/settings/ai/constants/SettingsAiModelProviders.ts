import {
  IconBrandAnthropic,
  IconBrandGoogle,
  IconBrandMistral,
  IconBrandOpenai,
  IconBrandXai,
  IconRobot,
  type IconComponent,
} from 'twenty-ui/display';

export const MODEL_FAMILY_CONFIG: Record<
  string,
  { label: string; Icon: IconComponent }
> = {
  OPENAI: { label: 'OpenAI', Icon: IconBrandOpenai },
  ANTHROPIC: { label: 'Anthropic', Icon: IconBrandAnthropic },
  XAI: { label: 'xAI', Icon: IconBrandXai },
  GOOGLE: { label: 'Google', Icon: IconBrandGoogle },
  MISTRAL: { label: 'Mistral', Icon: IconBrandMistral },
  FALLBACK: { label: '', Icon: IconRobot },
};
