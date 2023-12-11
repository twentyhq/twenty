import { selectorFamily } from 'recoil';

import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { currentViewFiltersScopedFamilyState } from '../currentViewFiltersScopedFamilyState';
import { savedViewFiltersScopedFamilyState } from '../savedViewFiltersScopedFamilyState';

export const canPersistViewFiltersScopedFamilySelector = selectorFamily({
  key: 'canPersistFiltersScopedFamilySelector',
  get:
    ({ viewScopeId, viewId }: { viewScopeId: string; viewId?: string }) =>
    ({ get }) => {
      if (!viewId) {
        return;
      }

      return !isDeeplyEqual(
        get(
          savedViewFiltersScopedFamilyState({
            scopeId: viewScopeId,
            familyKey: viewId,
          }),
        ),
        get(
          currentViewFiltersScopedFamilyState({
            scopeId: viewScopeId,
            familyKey: viewId,
          }),
        ),
      );
    },
});
