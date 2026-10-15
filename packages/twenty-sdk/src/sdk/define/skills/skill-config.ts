import { type SkillManifest } from 'twenty-shared/application';

import { type WithTranslatableProperties } from '@/sdk/define/common/types/translatable-text.type';

export type TranslatableSkillConfig = WithTranslatableProperties<
  SkillManifest,
  'label' | 'description'
>;
