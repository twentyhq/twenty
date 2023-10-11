import { atom } from 'recoil';

import { MetadataObject } from '../types/MetadataObject';

export const metadataObjectsState = atom<MetadataObject[]>({
  key: 'metadataObjectsState',
  default: [],
});
