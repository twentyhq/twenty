import { selectorFamily } from 'recoil';

import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { sortsScopedState } from '../../../ui/data/sort/states/sortsScopedState';
import { savedSortsFamilyState } from '../savedSortsFamilyState';

export const canPersistSortsScopedFamilySelector = selectorFamily({
  key: 'canPersistSortsScopedFamilySelector',
  get:
    ({ viewScopeId, viewId }: { viewScopeId: string; viewId: string }) =>
    ({ get }) =>
      !isDeeplyEqual(
        get(savedSortsFamilyState({ scopeId: viewScopeId, familyKey: viewId })),
        get(sortsScopedState({ scopeId: viewScopeId })),
      ),
});
