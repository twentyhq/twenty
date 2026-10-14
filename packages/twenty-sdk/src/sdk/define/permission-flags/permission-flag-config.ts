import { type PermissionFlagManifest } from 'twenty-shared/application';

import { type WithTranslatableProperties } from '@/sdk/define/common/types/translatable-text.type';

export type PermissionFlagConfig = PermissionFlagManifest;

export type TranslatablePermissionFlagConfig = WithTranslatableProperties<
  PermissionFlagConfig,
  'label' | 'description'
>;
