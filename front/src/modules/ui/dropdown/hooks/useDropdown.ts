import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useRecoilScopedStateV2 } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedStateV2';

import { dropdownHotkeyScopeScopedState } from '../states/dropdownHotkeyScopeScopedState';
import { isDropdownOpenScopedState } from '../states/isDropdownOpenScopedState';

export const useDropdown = ({ dropdownId }: { dropdownId: string }) => {
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const [isDropdownOpen, setIsDropdownOpen] = useRecoilScopedStateV2(
    isDropdownOpenScopedState,
    dropdownId,
  );

  const [dropdownHotkeyScope] = useRecoilScopedStateV2(
    dropdownHotkeyScopeScopedState,
    dropdownId,
  );

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
  };
};
