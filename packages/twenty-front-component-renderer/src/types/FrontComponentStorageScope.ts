import { type FrontComponentStorageType } from 'twenty-sdk/front-component';

import { type FrontComponentStorageNamespace } from '@/types/FrontComponentStorageNamespace';

export type FrontComponentStorageScope = FrontComponentStorageNamespace & {
  storageType: FrontComponentStorageType;
};
