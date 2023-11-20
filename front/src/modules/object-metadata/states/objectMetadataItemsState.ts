import { atom } from 'recoil';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const objectMetadataItemsState = atom<ObjectMetadataItem[]>({
  key: 'objectMetadataItemsState',
  default: [],
});
