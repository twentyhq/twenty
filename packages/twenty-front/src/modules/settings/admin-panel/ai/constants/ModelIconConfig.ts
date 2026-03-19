import {
  IconBrandGemini,
  IconBrandGroq,
  IconBrandMistral,
  IconBrandXai,
  IconModelClaude,
  IconProviderOpenai,
  IconRobot,
  type IconComponent,
} from 'twenty-ui/display';

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
