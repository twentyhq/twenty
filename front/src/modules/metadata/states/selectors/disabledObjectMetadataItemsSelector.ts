import { selector } from 'recoil';

import { ObjectMetadataItem } from '../../types/ObjectMetadataItem';
import { objectMetadataItemsState } from '../objectMetadataItemsState';

export const disabledObjectMetadataItemsSelector = selector<
  ObjectMetadataItem[]
>({
  key: 'disabledObjectMetadataItemsSelector',
  get: ({ get }) =>
    get(objectMetadataItemsState).filter(({ isActive }) => !isActive),
});
