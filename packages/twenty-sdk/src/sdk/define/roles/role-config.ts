import type { RoleManifest } from 'twenty-shared/application';

import { type WithTranslatableProperties } from '@/sdk/define/common/types/translatable-text.type';

export type RoleConfig = WithTranslatableProperties<
  RoleManifest,
  'label' | 'description'
>;
