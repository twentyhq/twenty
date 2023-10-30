import { selector } from 'recoil';

import { ObjectMetadataItem } from '../../types/ObjectMetadataItem';
import { ObjectMetadataItemsState } from '../ObjectMetadataItemsState';

export const disabledObjectMetadataItemsSelector = selector<
  ObjectMetadataItem[]
>({
  key: 'disabledObjectMetadataItemsSelector',
  get: ({ get }) =>
    get(ObjectMetadataItemsState).filter(({ isActive }) => !isActive),
});
