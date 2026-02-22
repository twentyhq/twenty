import {
  IconBrandAnthropic,
  IconBrandGoogle,
  IconBrandMistral,
  IconBrandOpenai,
  IconBrandXai,
  IconRobot,
  type IconComponent,
} from 'twenty-ui/display';
import { ModelFamily } from '~/generated-metadata/graphql';

export const MODEL_FAMILY_CONFIG: Record<
  ModelFamily | 'FALLBACK',
  { label: string; Icon: IconComponent }
> = {
  [ModelFamily.OPENAI]: { label: 'OpenAI', Icon: IconBrandOpenai },
  [ModelFamily.ANTHROPIC]: { label: 'Anthropic', Icon: IconBrandAnthropic },
  [ModelFamily.XAI]: { label: 'xAI', Icon: IconBrandXai },
  [ModelFamily.GOOGLE]: { label: 'Google', Icon: IconBrandGoogle },
  [ModelFamily.MISTRAL]: { label: 'Mistral', Icon: IconBrandMistral },
  FALLBACK: { label: '', Icon: IconRobot },
};
