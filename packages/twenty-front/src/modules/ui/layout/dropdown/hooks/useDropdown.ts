import { useRecoilState } from 'recoil';

import { useDropdownStates } from '@/ui/layout/dropdown/hooks/internal/useDropdownStates';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { getScopeIdOrUndefinedFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdOrUndefinedFromComponentId';

export const useDropdown = (dropdownId?: string) => {
  const {
    scopeId,
    dropdownHotkeyScopeState,
    dropdownWidthState,
    isDropdownOpenState,
  } = useDropdownStates({
    dropdownScopeId: getScopeIdOrUndefinedFromComponentId(dropdownId),
  });

  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const [dropdownHotkeyScope] = useRecoilState(dropdownHotkeyScopeState());

  const [dropdownWidth, setDropdownWidth] =
    useRecoilState(dropdownWidthState());

  const [isDropdownOpen, setIsDropdownOpen] = useRecoilState(
    isDropdownOpenState(),
  );

  const closeDropdown = () => {
    goBackToPreviousHotkeyScope();
    setIsDropdownOpen(false);
  };

  const openDropdown = () => {
    setIsDropdownOpen(true);
    if (dropdownHotkeyScope) {
      setHotkeyScopeAndMemorizePreviousScope(
        dropdownHotkeyScope.scope,
        dropdownHotkeyScope.customScopes,
      );
    }
  };

  const toggleDropdown = () => {
    if (isDropdownOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  };

  return {
    scopeId,
    isDropdownOpen: isDropdownOpen,
    closeDropdown,
    toggleDropdown,
    openDropdown,
    dropdownWidth,
    setDropdownWidth,
  };
};
