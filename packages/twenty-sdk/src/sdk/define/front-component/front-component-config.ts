import { type FrontComponentManifest } from 'twenty-shared/application';

import { type WithTranslatableProperties } from '@/sdk/define/common/types/translatable-text.type';

export type FrontComponentType = React.ComponentType<any>;

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
