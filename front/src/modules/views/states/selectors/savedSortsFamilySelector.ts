import { selectorFamily } from 'recoil';

export const savedSortsFamilySelector = selectorFamily({
  key: 'savedSortsFamilySelector',
  get:
    ({ scopeId, viewId }: { scopeId: string; viewId: string }) =>
    ({ get }) =>
      get(savedSortsFamilyState({ scopeId: scopeId, familyKey: viewId })),
});
