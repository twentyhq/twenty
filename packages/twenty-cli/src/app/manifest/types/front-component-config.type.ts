import { type FrontComponentManifest } from 'twenty-shared/application';

import { type WithTranslatableProperties } from '@/app/manifest/types/translatable-text.type';

export type FrontComponentType = { name: string };

export type FrontComponentConfig = WithTranslatableProperties<
  Omit<
    FrontComponentManifest,
    | 'sourceComponentPath'
    | 'builtComponentPath'
    | 'builtComponentChecksum'
    | 'componentName'
    | 'usesSdkClient'
  >,
  'name' | 'description'
> & {
  component: FrontComponentType;
};
