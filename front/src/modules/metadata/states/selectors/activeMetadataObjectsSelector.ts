import { selector } from 'recoil';

import { MetadataObject } from '../../types/MetadataObject';
import { metadataObjectsState } from '../metadataObjectsState';

export const activeMetadataObjectsSelector = selector<MetadataObject[]>({
  key: 'activeMetadataObjectsSelector',
  get: ({ get }) =>
    get(metadataObjectsState).filter(({ isActive }) => isActive),
});
