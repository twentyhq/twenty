import { selectorFamily } from 'recoil';

import type { SelectedSortType } from '../../types/interface';
import { savedSortsFamilyState } from '../savedSortsFamilyState';

export const savedSortsByKeyFamilySelector = selectorFamily({
  key: 'savedSortsByKeyFamilySelector',
  get:
    (viewId: string | undefined) =>
    ({ get }) =>
      get(savedSortsFamilyState(viewId)).reduce<
        Record<string, SelectedSortType<any>>
      >((result, sort) => ({ ...result, [sort.key]: sort }), {}),
});
