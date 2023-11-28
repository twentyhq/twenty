import { selectableItemIdsScopedState } from '@/ui/layout/selectable-list/states/selectableItemIdsScopedState';
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

  return {
    isSelectedItemIdSelector,
    selectableItemIdsState,
    selectedItemIdState,
  };
};
