import { selectableItemIdsScopeState } from '@/ui/layout/selectable-list/states/selectableItemIdsScopeState';
import { selectableItemIdsSelectedMapScopedFamilyState } from '@/ui/layout/selectable-list/states/selectableItemIdsSelectedMapScopedFamilyState';
import { selectedItemIdScopedState } from '@/ui/layout/selectable-list/states/selectedItemIdScopedState';
import { getScopedFamilyState } from '@/ui/utilities/recoil-scope/utils/getScopedFamilyState';
import { getScopedState } from '@/ui/utilities/recoil-scope/utils/getScopedState';

export const getSelectableListScopedStates = ({
  selectableListScopeId,
  itemId,
}: {
  selectableListScopeId: string;
  itemId?: string;
}) => {
  const selectableItemIdsSelectedMapState = getScopedFamilyState(
    selectableItemIdsSelectedMapScopedFamilyState,
    selectableListScopeId,
    itemId ?? '',
  );

  const selectedItemIdState = getScopedState(
    selectedItemIdScopedState,
    selectableListScopeId,
  );
  const selectableItemIdsState = getScopedState(
    selectableItemIdsScopeState,
    selectableListScopeId,
  );

  return {
    selectableItemIdsSelectedMapState,
    selectableItemIdsState,
    selectedItemIdState,
  };
};
