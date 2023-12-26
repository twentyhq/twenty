import { DropdownScopeInternalContext } from '@/ui/layout/dropdown/scopes/scope-internal-context/DropdownScopeInternalContext';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { useScopedState } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useScopedState';

type UseDropdownScopedStatesProps = {
  dropdownScopeId?: string;
};

export const useDropdownScopedStates = ({
  dropdownScopeId,
}: UseDropdownScopedStatesProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    DropdownScopeInternalContext,
    dropdownScopeId,
  );

  const {
    getScopedState,
    getScopedFamilyState,
    getScopedSnapshotValue,
    getScopedFamilySnapshotValue,
  } = useScopedState(scopeId);

  return {
    scopeId,
    injectStateWithDropdownScopeId: getScopedState,
    injectFamilyStateWithDropdownScopeId: getScopedFamilyState,
    injectSnapshotValueWithDropdownScopeId: getScopedSnapshotValue,
    injectFamilySnapshotValueWithDropdownScopeId: getScopedFamilySnapshotValue,
  };
};
