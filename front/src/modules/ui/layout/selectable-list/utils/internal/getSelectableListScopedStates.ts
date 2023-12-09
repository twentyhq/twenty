import { selectableItemIdsScopedState } from '@/ui/layout/selectable-list/states/selectableItemIdsScopedState';
import { selectableListOnEnterScopedState } from '@/ui/layout/selectable-list/states/selectableListOnEnterScopedState';
import { selectedItemIdScopedState } from '@/ui/layout/selectable-list/states/selectedItemIdScopedState';
import { isSelectedItemIdScopedFamilySelector } from '@/ui/layout/selectable-list/states/selectors/isSelectedItemIdScopedFamilySelector';
import { getScopedState } from '@/ui/utilities/recoil-scope/utils/getScopedState';

const UNDEFINED_SELECTABLE_ITEM_ID = 'UNDEFINED_SELECTABLE_ITEM_ID';

export const getSelectableListScopedStates = ({
  selectableListScopeId,
  itemId,
}: {
  selectableListScopeId: string;
  itemId?: string;
}) => {
  const isSelectedItemIdSelector = isSelectedItemIdScopedFamilySelector({
    scopeId: selectableListScopeId,
    itemId: itemId ?? UNDEFINED_SELECTABLE_ITEM_ID,
  });

  const selectedItemIdState = getScopedState(
    selectedItemIdScopedState,
    selectableListScopeId,
  );

  const selectableItemIdsState = getScopedState(
    selectableItemIdsScopedState,
    selectableListScopeId,
  );

  const selectableListOnEnterState = getScopedState(
    selectableListOnEnterScopedState,
    selectableListScopeId,
  );

  return {
    isSelectedItemIdSelector,
    selectableItemIdsState,
    selectedItemIdState,
    selectableListOnEnterState,
  };
};
