import { selector } from 'recoil';

import { MetadataObject } from '../../types/MetadataObject';
import { metadataObjectsState } from '../metadataObjectsState';

export const disabledMetadataObjectsSelector = selector<MetadataObject[]>({
  key: 'disabledMetadataObjectsSelector',
  get: ({ get }) =>
    get(metadataObjectsState).filter(({ isActive }) => !isActive),
});
