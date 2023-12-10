import { selectorFamily } from 'recoil';

import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { currentViewSortsScopedFamilyState } from '../currentViewSortsScopedFamilyState';
import { savedViewSortsScopedFamilyState } from '../savedViewSortsScopedFamilyState';

export const canPersistViewSortsScopedFamilySelector = selectorFamily({
  key: 'canPersistSortsScopedFamilySelector',
  get:
    ({ viewScopeId, viewId }: { viewScopeId: string; viewId?: string }) =>
    ({ get }) => {
      if (!viewId) {
        return;
      }
      return !isDeeplyEqual(
        get(
          savedViewSortsScopedFamilyState({
            scopeId: viewScopeId,
            familyKey: viewId,
          }),
        ),
        get(
          currentViewSortsScopedFamilyState({
            scopeId: viewScopeId,
            familyKey: viewId,
          }),
        ),
      );
    },
});
