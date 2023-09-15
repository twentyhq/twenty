import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useRecoilScopedFamilyState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedFamilyState';

import { dropdownButtonHotkeyScopeScopedFamilyState } from '../states/dropdownButtonHotkeyScopeScopedFamilyState';
import { isDropdownButtonOpenScopedFamilyState } from '../states/isDropdownButtonOpenScopedFamilyState';
import { DropdownRecoilScopeContext } from '../states/recoil-scope-contexts/DropdownRecoilScopeContext';

export function useDropdownButton({ dropdownId }: { dropdownId: string }) {
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const [isDropdownButtonOpen, setIsDropdownButtonOpen] =
    useRecoilScopedFamilyState(
      isDropdownButtonOpenScopedFamilyState,
      dropdownId,
      DropdownRecoilScopeContext,
    );

  const [dropdownButtonHotkeyScope] = useRecoilScopedFamilyState(
    dropdownButtonHotkeyScopeScopedFamilyState,
    dropdownId,
    DropdownRecoilScopeContext,
  );

  function closeDropdownButton() {
    goBackToPreviousHotkeyScope();
    setIsDropdownButtonOpen(false);
  }

  function openDropdownButton() {
    setIsDropdownButtonOpen(true);

    if (dropdownButtonHotkeyScope) {
      setHotkeyScopeAndMemorizePreviousScope(
        dropdownButtonHotkeyScope.scope,
        dropdownButtonHotkeyScope.customScopes,
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
