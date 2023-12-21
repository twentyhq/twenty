import { selectableItemIdsScopedState } from '@/ui/layout/selectable-list/states/selectableItemIdsScopedState';
import { selectableListOnEnterScopedState } from '@/ui/layout/selectable-list/states/selectableListOnEnterScopedState';
import { selectedItemIdScopedState } from '@/ui/layout/selectable-list/states/selectedItemIdScopedState';
import { isSelectedItemIdScopedFamilySelector } from '@/ui/layout/selectable-list/states/selectors/isSelectedItemIdScopedFamilySelector';
import { getFamilyScopeInjector } from '@/ui/utilities/recoil-scope/utils/getFamilyScopeInjector';
import { getScopeInjector } from '@/ui/utilities/recoil-scope/utils/getScopeInjector';

export const getSelectableListScopeInjectors = () => {
  const selectedItemIdScopeInjector = getScopeInjector(
    selectedItemIdScopedState,
  );
  const selectableItemIdsScopeInjector = getScopeInjector(
    selectableItemIdsScopedState,
  );
  const selectableListOnEnterScopeInjector = getScopeInjector(
    selectableListOnEnterScopedState,
  );
  const isSelectedItemIdFamilyScopeInjector = getFamilyScopeInjector(
    isSelectedItemIdScopedFamilySelector,
  );

  return {
    selectedItemIdScopeInjector,
    selectableItemIdsScopeInjector,
    selectableListOnEnterScopeInjector,
    isSelectedItemIdFamilyScopeInjector,
  };
};
