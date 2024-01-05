import { isSelectedItemIdFamilyStateScopeMap } from '@/ui/layout/selectable-list/states/isSelectedItemIdFamilyStateScopeMap';
import { createFamilySelectorScopeMap } from '@/ui/utilities/recoil-scope/utils/createFamilySelectorScopeMap';

export const isSelectedItemIdFamilySelectorScopeMap =
  createFamilySelectorScopeMap<boolean, string>({
    key: 'isSelectedItemIdScopedFamilySelector',
    get:
      ({ scopeId, familyKey }: { scopeId: string; familyKey: string }) =>
      ({ get }) =>
        get(
          isSelectedItemIdFamilyStateScopeMap({
            scopeId: scopeId,
            familyKey: familyKey,
          }),
        ),
    set:
      ({ scopeId, familyKey }: { scopeId: string; familyKey: string }) =>
      ({ set }, newValue) =>
        set(
          isSelectedItemIdFamilyStateScopeMap({
            scopeId: scopeId,
            familyKey: familyKey,
          }),
          newValue,
        ),
  });
