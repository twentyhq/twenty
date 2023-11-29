import { selectorFamily } from 'recoil';

import { isSelectedItemIdMapScopedFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdMapScopedFamilyState';

export const isSelectedItemIdScopedFamilySelector = selectorFamily({
  key: 'isSelectedItemIdScopedFamilySelector',
  get:
    ({ scopeId, itemId }: { scopeId: string; itemId: string }) =>
    ({ get }) =>
      get(
        isSelectedItemIdMapScopedFamilyState({
          scopeId: scopeId,
          familyKey: itemId,
        }),
      ),
  set:
    ({ scopeId, itemId }: { scopeId: string; itemId: string }) =>
    ({ set }, newValue) =>
      set(
        isSelectedItemIdMapScopedFamilyState({
          scopeId: scopeId,
          familyKey: itemId,
        }),
        newValue,
      ),
});
