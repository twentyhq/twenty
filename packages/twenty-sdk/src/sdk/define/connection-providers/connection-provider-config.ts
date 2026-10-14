import { type ConnectionProviderManifest } from 'twenty-shared/application';

import { type WithTranslatableProperties } from '@/sdk/define/common/types/translatable-text.type';

export type TranslatableConnectionProviderConfig = WithTranslatableProperties<
  ConnectionProviderManifest,
  'displayName'
>;
