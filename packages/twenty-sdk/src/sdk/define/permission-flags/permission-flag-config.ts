import { type PermissionFlagManifest } from 'twenty-shared/application';

import { type WithTranslatableProperties } from '@/sdk/define/common/types/translatable-text.type';

export type PermissionFlagConfig = WithTranslatableProperties<
  PermissionFlagManifest,
  'label' | 'description'
>;
