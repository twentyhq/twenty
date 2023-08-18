import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { dropdownButtonCustomHotkeyScopeScopedState } from '../states/dropdownButtonCustomHotkeyScopeScopedState';
import { isDropdownButtonOpenScopedState } from '../states/isDropdownButtonOpenScopedState';

export function useDropdownButton() {
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const [isDropdownButtonOpen, setIsDropdownButtonOpen] = useRecoilScopedState(
    isDropdownButtonOpenScopedState,
  );

  const [dropdownButtonCustomHotkeyScope] = useRecoilScopedState(
    dropdownButtonCustomHotkeyScopeScopedState,
  );

  function closeDropdownButton() {
    goBackToPreviousHotkeyScope();
    setIsDropdownButtonOpen(false);
  }

  function openDropdownButton() {
    setIsDropdownButtonOpen(true);

    if (dropdownButtonCustomHotkeyScope) {
      setHotkeyScopeAndMemorizePreviousScope(
        dropdownButtonCustomHotkeyScope.scope,
        dropdownButtonCustomHotkeyScope.customScopes,
      );
    }
  }

  function toggleDropdownButton() {
    if (isDropdownButtonOpen) {
      closeDropdownButton();
    } else {
      openDropdownButton();
    }
  }

  return {
    isDropdownButtonOpen,
    closeDropdownButton,
    toggleDropdownButton,
    openDropdownButton,
  };
}
