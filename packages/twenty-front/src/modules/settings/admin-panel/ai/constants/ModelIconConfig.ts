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
  gpt: { label: 'GPT', Icon: IconProviderOpenai },
  claude: { label: 'Claude', Icon: IconModelClaude },
  gemini: { label: 'Gemini', Icon: IconBrandGemini },
  mistral: { label: 'Mistral', Icon: IconBrandMistral },
  grok: { label: 'Grok', Icon: IconBrandXai },
  FALLBACK: { label: '', Icon: IconRobot },
};
