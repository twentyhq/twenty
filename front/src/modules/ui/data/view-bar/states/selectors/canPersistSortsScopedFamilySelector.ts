import { selectorFamily } from 'recoil';

import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { savedSortsFamilyState } from '../savedSortsFamilyState';
import { sortsScopedState } from '../sortsScopedState';

export const canPersistSortsScopedFamilySelector = selectorFamily({
  key: 'canPersistSortsScopedFamilySelector',
  get:
    ({
      recoilScopeId,
      viewId,
    }: {
      recoilScopeId: string;
      viewId: string | undefined;
    }) =>
    ({ get }) =>
      !isDeeplyEqual(
        get(savedSortsFamilyState(viewId)),
        get(sortsScopedState(recoilScopeId)),
      ),
});
