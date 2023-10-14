import { selectorFamily } from 'recoil';

import { Sort } from '../../types/Sort';
import { savedSortsFamilyState } from '../savedSortsFamilyState';

export const savedSortsByKeyFamilySelector = selectorFamily({
  key: 'savedSortsByKeyFamilySelector',
  get:
    (viewId: string | undefined) =>
    ({ get }) =>
      get(savedSortsFamilyState(viewId)).reduce<Record<string, Sort>>(
        (result, sort) => ({ ...result, [sort.key]: sort }),
        {},
      ),
});
