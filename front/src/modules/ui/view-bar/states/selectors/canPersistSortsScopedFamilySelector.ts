import { selectorFamily } from 'recoil';

import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { savedSortsFamilyState } from '../savedSortsFamilyState';
import { sortsScopedState } from '../sortsScopedState';

export const canPersistSortsScopedFamilySelector = selectorFamily({
  key: 'canPersistSortsScopedFamilySelector',
  get:
    ([scopeId, viewId]: [string, string | undefined]) =>
    ({ get }) =>
      !isDeeplyEqual(
        get(savedSortsFamilyState(viewId)),
        get(sortsScopedState(scopeId)),
      ),
});
