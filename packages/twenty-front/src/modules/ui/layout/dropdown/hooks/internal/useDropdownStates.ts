import { DropdownScopeInternalContext } from '@/ui/layout/dropdown/scopes/scope-internal-context/DropdownScopeInternalContext';
import { dropdownHotkeyStateScopeMap } from '@/ui/layout/dropdown/states/dropdownHotkeyStateScopeMap';
import { dropdownWidthStateScopeMap } from '@/ui/layout/dropdown/states/dropdownWidthStateScopeMap';
import { isDropdownOpenStateScopeMap } from '@/ui/layout/dropdown/states/isDropdownOpenStateScopeMap';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { getState } from '@/ui/utilities/recoil-scope/utils/getState';

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
    dropdownHotkeyScopeState: getState(dropdownHotkeyStateScopeMap, scopeId),
    dropdownWidthState: getState(dropdownWidthStateScopeMap, scopeId),
    isDropdownOpenState: getState(isDropdownOpenStateScopeMap, scopeId),
  };
};
