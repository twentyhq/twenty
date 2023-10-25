import { selectorFamily } from 'recoil';

import { savedSortsScopedFamilyState } from '../savedSortsScopedFamilyState';

export const savedSortsFamilySelector = selectorFamily({
  key: 'savedSortsFamilySelector',
  get:
    ({ scopeId, viewId }: { scopeId: string; viewId: string }) =>
    ({ get }) =>
      get(savedSortsScopedFamilyState({ scopeId: scopeId, familyKey: viewId })),
});
