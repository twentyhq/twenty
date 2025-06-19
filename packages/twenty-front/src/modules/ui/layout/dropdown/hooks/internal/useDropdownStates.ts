import { DropdownScopeInternalContext } from '@/ui/layout/dropdown/scopes/scope-internal-context/DropdownScopeInternalContext';
import { dropdownPlacementComponentState } from '@/ui/layout/dropdown/states/dropdownPlacementComponentState';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';

type UseDropdownStatesProps = {
  dropdownScopeId?: string;
};

export const useDropdownStates = ({
  dropdownScopeId,
}: UseDropdownStatesProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    DropdownScopeInternalContext,
    dropdownScopeId,
  );

  return {
    scopeId,
    dropdownPlacementState: extractComponentState(
      dropdownPlacementComponentState,
      scopeId,
    ),
    isDropdownOpenState: extractComponentState(
      isDropdownOpenComponentState,
      scopeId,
    ),
  };
};
