import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

import { DropdownScopeInternalContext } from '../scopes/scope-internal-context/DropdownScopeInternalContext';

import { useDropdownStates } from './useDropdownStates';

type UseDropdownProps = {
  dropdownScopeId?: string;
};

export const useDropdown = (props?: UseDropdownProps) => {
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const scopeId = useAvailableScopeIdOrThrow(
    DropdownScopeInternalContext,
    props?.dropdownScopeId,
  );

  const {
    dropdownHotkeyScope,
    setDropdownHotkeyScope,
    isDropdownOpen,
    setIsDropdownOpen,
  } = useDropdownStates({
    scopeId,
  });

  const closeDropdownButton = () => {
    goBackToPreviousHotkeyScope();
    setIsDropdownOpen(false);
  };

  const openDropdownButton = () => {
    setIsDropdownOpen(true);

    if (dropdownHotkeyScope) {
      setHotkeyScopeAndMemorizePreviousScope(
        dropdownHotkeyScope.scope,
        dropdownHotkeyScope.customScopes,
      );
    }
  };

  const toggleDropdownButton = () => {
    if (isDropdownOpen) {
      closeDropdownButton();
    } else {
      openDropdownButton();
    }
  };

  return {
    isDropdownOpen: isDropdownOpen,
    closeDropdown: closeDropdownButton,
    toggleDropdown: toggleDropdownButton,
    openDropdown: openDropdownButton,
    scopeId,
    dropdownHotkeyScope,
    setDropdownHotkeyScope,
  };
};
