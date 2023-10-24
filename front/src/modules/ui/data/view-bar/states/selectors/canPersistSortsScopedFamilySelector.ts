import { selectorFamily } from 'recoil';

import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { sortsScopedState } from '../../../../../views/states/sortsScopedState';
import { savedSortsFamilyState } from '../savedSortsFamilyState';

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
        get(sortsScopedState({ scopeId: recoilScopeId })),
      ),
});
