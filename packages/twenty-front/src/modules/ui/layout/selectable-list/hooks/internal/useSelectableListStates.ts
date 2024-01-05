import { SelectableListScopeInternalContext } from '@/ui/layout/selectable-list/scopes/scope-internal-context/SelectableListScopeInternalContext';
import { selectableItemIdsStateScopeMap } from '@/ui/layout/selectable-list/states/selectableItemIdsStateScopeMap';
import { selectableListOnEnterStateScopeMap } from '@/ui/layout/selectable-list/states/selectableListOnEnterStateScopeMap';
import { selectedItemIdStateScopeMap } from '@/ui/layout/selectable-list/states/selectedItemIdStateScopeMap';
import { isSelectedItemIdFamilySelectorScopeMap } from '@/ui/layout/selectable-list/states/selectors/isSelectedItemIdFamilySelectorScopeMap';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { getFamilyState } from '@/ui/utilities/recoil-scope/utils/getFamilyState';
import { getState } from '@/ui/utilities/recoil-scope/utils/getState';

type useSelectableListStatesProps = {
  selectableListScopeId?: string;
};

export const useSelectableListStates = ({
  selectableListScopeId,
}: useSelectableListStatesProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    SelectableListScopeInternalContext,
    selectableListScopeId,
  );

  return {
    scopeId,
    isSelectedItemIdSelector: getFamilyState(
      isSelectedItemIdFamilySelectorScopeMap,
      scopeId,
    ),
    selectableItemIdsState: getState(selectableItemIdsStateScopeMap, scopeId),
    selectableListOnEnterState: getState(
      selectableListOnEnterStateScopeMap,
      scopeId,
    ),
    selectedItemIdState: getState(selectedItemIdStateScopeMap, scopeId),
  };
};
