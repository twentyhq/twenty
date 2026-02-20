import {
  IconAnthropic,
  IconBrandOpenai,
  IconBrandX,
  IconRobot,
  type IconComponent,
} from 'twenty-ui/display';

export const PROVIDER_CONFIG: Record<
  string,
  { label: string; Icon: IconComponent }
> = {
  OPENAI: { label: 'OpenAI', Icon: IconBrandOpenai },
  ANTHROPIC: { label: 'Anthropic', Icon: IconAnthropic },
  XAI: { label: 'xAI', Icon: IconBrandX },
  GROQ: { label: 'Groq', Icon: IconRobot },
  OPENAI_COMPATIBLE: { label: 'OpenAI Compatible', Icon: IconBrandOpenai },
  NONE: { label: '', Icon: IconRobot },
};
