import { type FrontComponentManifest } from 'twenty-shared/application';

import { type WithTranslatableProperties } from '@/app/manifest/types/translatable-text.type';

export type FrontComponentType = { name: string };

export type FrontComponentConfig = Omit<
  FrontComponentManifest,
  | 'sourceComponentPath'
  | 'builtComponentPath'
  | 'builtComponentChecksum'
  | 'componentName'
  | 'usesSdkClient'
> & {
  component: FrontComponentType;
};

export type TranslatableFrontComponentConfig = WithTranslatableProperties<
  FrontComponentConfig,
  'name' | 'description'
>;
