import type { RoleManifest } from 'twenty-shared/application';

import { type WithTranslatableProperties } from '@/app/manifest/types/translatable-text.type';

export type RoleConfig = RoleManifest;

export type TranslatableRoleConfig = WithTranslatableProperties<
  RoleConfig,
  'label' | 'description'
>;
