import {
  IconBrandGemini,
  IconBrandMistral,
  IconBrandXai,
  IconModelClaude,
  IconProviderOpenai,
  IconRobot,
  type IconComponent,
} from 'twenty-ui/display';

import { ModelFamily } from '~/generated-admin/graphql';

export type ModelIconConfigKey = ModelFamily | 'FALLBACK';

export const MODEL_ICON_CONFIG: Record<ModelIconConfigKey, IconComponent> = {
  [ModelFamily.GPT]: IconProviderOpenai,
  [ModelFamily.CLAUDE]: IconModelClaude,
  [ModelFamily.GEMINI]: IconBrandGemini,
  [ModelFamily.MISTRAL]: IconBrandMistral,
  [ModelFamily.GROK]: IconBrandXai,
  FALLBACK: IconRobot,
};
