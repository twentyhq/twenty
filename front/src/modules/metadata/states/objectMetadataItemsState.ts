import { atom } from 'recoil';

import { ObjectMetadataItem } from '../types/ObjectMetadataItem';

/**
 * @deprecated Use `useFindManyObjectMetadataItems` instead.
 */
export const objectMetadataItemsState = atom<ObjectMetadataItem[]>({
  key: 'objectMetadataItemsState',
  default: [],
});
