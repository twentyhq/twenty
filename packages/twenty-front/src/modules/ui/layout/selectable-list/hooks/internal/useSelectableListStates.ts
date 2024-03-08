import { SelectableListScopeInternalContext } from '@/ui/layout/selectable-list/scopes/scope-internal-context/SelectableListScopeInternalContext';
import { selectableItemIdsComponentState } from '@/ui/layout/selectable-list/states/selectableItemIdsComponentState';
import { selectableListOnEnterComponentState } from '@/ui/layout/selectable-list/states/selectableListOnEnterComponentState';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { isSelectedItemIdFamilySelector } from '@/ui/layout/selectable-list/states/selectors/isSelectedItemIdFamilySelector';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { extractComponentFamilyState } from '@/ui/utilities/state/component-state/utils/extractComponentFamilyState';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';

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
    isSelectedItemIdSelector: extractComponentFamilyState(
      isSelectedItemIdFamilySelector,
      scopeId,
    ),
    selectableItemIdsState: extractComponentState(
      selectableItemIdsComponentState,
      scopeId,
    ),
    selectableListOnEnterState: extractComponentState(
      selectableListOnEnterComponentState,
      scopeId,
    ),
    selectedItemIdState: extractComponentState(
      selectedItemIdComponentState,
      scopeId,
    ),
  };
};
