import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { createComponentFamilySelector } from '@/ui/utilities/state/component-state/utils/createComponentFamilySelector';

export const isSelectedItemIdFamilySelector = createComponentFamilySelector<
  boolean,
  string
>({
  key: 'isSelectedItemIdFamilySelector',
  get:
    ({ scopeId, familyKey }: { scopeId: string; familyKey: string }) =>
    ({ get }) =>
      get(
        isSelectedItemIdComponentFamilyState({
          scopeId: scopeId,
          familyKey: familyKey,
        }),
      ),
  set:
    ({ scopeId, familyKey }: { scopeId: string; familyKey: string }) =>
    ({ set }, newValue) =>
      set(
        isSelectedItemIdComponentFamilyState({
          scopeId: scopeId,
          familyKey: familyKey,
        }),
        newValue,
      ),
});
