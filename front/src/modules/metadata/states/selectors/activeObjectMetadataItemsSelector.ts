import { selector } from 'recoil';

import { ObjectMetadataItem } from '../../types/ObjectMetadataItem';
import { objectMetadataItemsState } from '../objectMetadataItemsState';

export const activeObjectMetadataItemsSelector = selector<ObjectMetadataItem[]>(
  {
    key: 'activeObjectMetadataItemsSelector',
    get: ({ get }) =>
      get(objectMetadataItemsState).filter(({ isActive }) => isActive),
  },
);
