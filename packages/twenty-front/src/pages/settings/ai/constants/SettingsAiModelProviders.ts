import {
  IconBrandAnthropic,
  IconBrandGoogle,
  IconBrandGroq,
  IconBrandMistral,
  IconBrandOpenai,
  IconBrandXai,
  IconRobot,
  type IconComponent,
} from 'twenty-ui/display';

export const PROVIDER_CONFIG: Record<
  string,
  { label: string; Icon: IconComponent }
> = {
  OPENAI: { label: 'OpenAI', Icon: IconBrandOpenai },
  ANTHROPIC: { label: 'Anthropic', Icon: IconBrandAnthropic },
  XAI: { label: 'xAI', Icon: IconBrandXai },
  GOOGLE: { label: 'Google', Icon: IconBrandGoogle },
  GROQ: { label: 'Groq', Icon: IconBrandGroq },
  MISTRAL: { label: 'Mistral', Icon: IconBrandMistral },
  NONE: { label: '', Icon: IconRobot },
};
