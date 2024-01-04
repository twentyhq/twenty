import { SelectableListScopeInternalContext } from '@/ui/layout/selectable-list/scopes/scope-internal-context/SelectableListScopeInternalContext';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { useScopedState } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useScopedState';

type UseSelectableListScopedStatesProps = {
  selectableListScopeId?: string;
};

export const useSelectableListScopedState = ({
  selectableListScopeId,
}: UseSelectableListScopedStatesProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    SelectableListScopeInternalContext,
    selectableListScopeId,
  );

  const {
    getScopedState,
    getScopedFamilyState,
    getScopedSnapshotValue,
    getScopedFamilySnapshotValue,
  } = useScopedState(scopeId);

  return {
    scopeId,
    injectStateWithSelectableListScopeId: getScopedState,
    injectFamilyStateWithSelectableListScopeId: getScopedFamilyState,
    injectSnapshotValueWithSelectableListScopeId: getScopedSnapshotValue,
    injectFamilySnapshotValueWithSelectableListScopeId:
      getScopedFamilySnapshotValue,
  };
};
