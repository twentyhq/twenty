import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useRecoilScopedFamilyState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedFamilyState';

import { dropdownButtonCustomHotkeyScopeScopedFamilyState } from '../states/dropdownButtonCustomHotkeyScopeScopedFamilyState';
import { isDropdownButtonOpenScopedFamilyState } from '../states/isDropdownButtonOpenScopedFamilyState';
import { DropdownRecoilScopeContext } from '../states/recoil-scope-contexts/DropdownRecoilScopeContext';

export function useDropdownButton({ key }: { key: string }) {
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const [isDropdownButtonOpen, setIsDropdownButtonOpen] =
    useRecoilScopedFamilyState(
      isDropdownButtonOpenScopedFamilyState,
      key,
      DropdownRecoilScopeContext,
    );

  const [dropdownButtonCustomHotkeyScope] = useRecoilScopedFamilyState(
    dropdownButtonCustomHotkeyScopeScopedFamilyState,
    key,
    DropdownRecoilScopeContext,
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
