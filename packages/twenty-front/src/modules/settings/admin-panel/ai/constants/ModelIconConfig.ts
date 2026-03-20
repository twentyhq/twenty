import {
  IconBrandGemini,
  IconBrandMistral,
  IconBrandXai,
  IconModelClaude,
  IconProviderOpenai,
  IconRobot,
  type IconComponent,
} from 'twenty-ui/display';

import { ModelFamily } from '~/generated-metadata/graphql';

export type ModelIconConfigKey = ModelFamily | 'FALLBACK';

export const MODEL_ICON_CONFIG: Record<
  ModelIconConfigKey,
  { label: string; Icon: IconComponent }
> = {
  [ModelFamily.GPT]: { label: 'GPT', Icon: IconProviderOpenai },
  [ModelFamily.CLAUDE]: { label: 'Claude', Icon: IconModelClaude },
  [ModelFamily.GEMINI]: { label: 'Gemini', Icon: IconBrandGemini },
  [ModelFamily.MISTRAL]: { label: 'Mistral', Icon: IconBrandMistral },
  [ModelFamily.GROK]: { label: 'Grok', Icon: IconBrandXai },
  FALLBACK: { label: '', Icon: IconRobot },
};
