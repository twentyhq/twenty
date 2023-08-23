import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { isDropdownButtonOpenScopedState } from '../states/isDropdownButtonOpenScopedState';

export function useDropdownButton() {
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const [isDropdownButtonOpen, setIsDropdownButtonOpen] = useRecoilScopedState(
    isDropdownButtonOpenScopedState,
  );

  function closeDropdownButton() {
    goBackToPreviousHotkeyScope();
    setIsDropdownButtonOpen(false);
  }

  function openDropdownButton(hotkeyScopeToSet?: HotkeyScope) {
    setIsDropdownButtonOpen(true);

    if (hotkeyScopeToSet) {
      setHotkeyScopeAndMemorizePreviousScope(
        hotkeyScopeToSet.scope,
        hotkeyScopeToSet.customScopes,
      );
    }
  }

  function toggleDropdownButton(hotkeyScopeToSet?: HotkeyScope) {
    if (isDropdownButtonOpen) {
      closeDropdownButton();
    } else {
      openDropdownButton(hotkeyScopeToSet);
    }
  }

  return {
    isDropdownButtonOpen,
    closeDropdownButton,
    toggleDropdownButton,
    openDropdownButton,
  };
}
