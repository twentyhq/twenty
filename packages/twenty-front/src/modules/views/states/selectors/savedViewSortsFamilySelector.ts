import { selectorFamily } from 'recoil';

import { savedViewSortsScopedFamilyState } from '../savedViewSortsScopedFamilyState';

export const savedViewSortsFamilySelector = selectorFamily({
  key: 'savedViewSortsFamilySelector',
  get:
    ({ scopeId, viewId }: { scopeId: string; viewId: string }) =>
    ({ get }) =>
      get(
        savedViewSortsScopedFamilyState({
          scopeId: scopeId,
          familyKey: viewId,
        }),
      ),
});
