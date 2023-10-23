import { atom } from 'recoil';

import { MetadataObject } from '../types/MetadataObject';

/**
 * @deprecated Use `useFindManyMetadataObjects` instead.
 */
export const metadataObjectsState = atom<MetadataObject[]>({
  key: 'metadataObjectsState',
  default: [],
});
