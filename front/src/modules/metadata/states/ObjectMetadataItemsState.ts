import { atom } from 'recoil';

import { ObjectMetadataItem } from '../types/ObjectMetadataItem';

/**
 * @deprecated Use `useFindManyObjectMetadataItems` instead.
 */
export const ObjectMetadataItemsState = atom<ObjectMetadataItem[]>({
  key: 'ObjectMetadataItemsState',
  default: [],
});
