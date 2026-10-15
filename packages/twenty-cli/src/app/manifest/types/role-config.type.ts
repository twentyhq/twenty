import type { RoleManifest } from 'twenty-shared/application';

import { type WithTranslatableProperties } from '@/app/manifest/types/translatable-text.type';

export type RoleConfig = WithTranslatableProperties<
  RoleManifest,
  'label' | 'description'
>;
