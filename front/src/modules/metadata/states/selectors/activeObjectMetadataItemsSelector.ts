import { selector } from 'recoil';

import { ObjectMetadataItem } from '../../types/ObjectMetadataItem';
import { ObjectMetadataItemsState } from '../ObjectMetadataItemsState';

export const activeObjectMetadataItemsSelector = selector<ObjectMetadataItem[]>(
  {
    key: 'activeObjectMetadataItemsSelector',
    get: ({ get }) =>
      get(ObjectMetadataItemsState).filter(({ isActive }) => isActive),
  },
);
