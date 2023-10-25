import { selectorFamily } from 'recoil';

import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { savedSortsScopedFamilyState } from '../savedSortsScopedFamilyState';
import { sortsScopedFamilyState } from '../sortsScopedFamilyState';

export const canPersistSortsScopedFamilySelector = selectorFamily({
  key: 'canPersistSortsScopedFamilySelector',
  get:
    ({ viewScopeId, viewId }: { viewScopeId: string; viewId: string }) =>
    ({ get }) =>
      !isDeeplyEqual(
        get(
          savedSortsScopedFamilyState({
            scopeId: viewScopeId,
            familyKey: viewId,
          }),
        ),
        get(
          sortsScopedFamilyState({ scopeId: viewScopeId, familyKey: viewId }),
        ),
      ),
});
