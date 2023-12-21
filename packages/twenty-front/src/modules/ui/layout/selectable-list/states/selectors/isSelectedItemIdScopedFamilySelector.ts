import { isSelectedItemIdMapScopedFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdMapScopedFamilyState';
import { createScopedFamilySelector } from '@/ui/utilities/recoil-scope/utils/createScopedFamilySelector';

export const isSelectedItemIdScopedFamilySelector = createScopedFamilySelector<
  boolean,
  string
>({
  key: 'isSelectedItemIdScopedFamilySelector',
  get:
    ({ scopeId, familyKey }: { scopeId: string; familyKey: string }) =>
    ({ get }) =>
      get(
        isSelectedItemIdMapScopedFamilyState({
          scopeId: scopeId,
          familyKey: familyKey,
        }),
      ),
  set:
    ({ scopeId, familyKey }: { scopeId: string; familyKey: string }) =>
    ({ set }, newValue) =>
      set(
        isSelectedItemIdMapScopedFamilyState({
          scopeId: scopeId,
          familyKey: familyKey,
        }),
        newValue,
      ),
});
