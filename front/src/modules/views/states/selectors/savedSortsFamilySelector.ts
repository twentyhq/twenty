import { selectorFamily } from 'recoil';

import { savedSortsFamilyState } from '../savedSortsFamilyState';

export const savedSortsFamilySelector = selectorFamily({
  key: 'savedSortsFamilySelector',
  get:
    ({ scopeId, viewId }: { scopeId: string; viewId: string }) =>
    ({ get }) =>
      get(savedSortsFamilyState({ scopeId: scopeId, familyKey: viewId })),
});
