import { SelectableListScopeInternalContext } from '@/ui/layout/selectable-list/scopes/scope-internal-context/SelectableListScopeInternalContext';
import { getSelectableListScopedStates } from '@/ui/layout/selectable-list/utils/internal/getSelectableListScopedStates';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

type UseSelectableListScopedStatesProps = {
  selectableListScopeId?: string;
  itemId?: string;
};

export const useSelectableListScopedStates = (
  args?: UseSelectableListScopedStatesProps,
) => {
  const { selectableListScopeId, itemId } = args ?? {};
  const scopeId = useAvailableScopeIdOrThrow(
    SelectableListScopeInternalContext,
    selectableListScopeId,
  );

  const {
    selectedItemIdState,
    selectableItemIdsState,
    isSelectedItemIdSelector,
    selectableListOnEnterState,
  } = getSelectableListScopedStates({
    selectableListScopeId: scopeId,
    itemId: itemId,
  });

  return {
    scopeId,
    isSelectedItemIdSelector,
    selectableItemIdsState,
    selectedItemIdState,
    selectableListOnEnterState,
  };
};
