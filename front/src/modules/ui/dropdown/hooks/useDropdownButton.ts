import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useRecoilScopedFamilyState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedFamilyState';

import { dropdownButtonCustomHotkeyScopeScopedFamilyState } from '../states/dropdownButtonCustomHotkeyScopeScopedFamilyState';
import { isDropdownButtonOpenScopedFamilyState } from '../states/isDropdownButtonOpenScopedFamilyState';
import { DropdownRecoilScopeContext } from '../states/recoil-scope-contexts/DropdownRecoilScopeContext';

// TODO: have a more explicit name than key
export function useDropdownButton({
  key,
  onDropdownToggle,
}: {
  key: string;
  onDropdownToggle?: (isDropdownButtonOpen: boolean) => void;
}) {
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
    onDropdownToggle?.(false);
  }

  function openDropdownButton() {
    setIsDropdownButtonOpen(true);

    if (dropdownButtonCustomHotkeyScope) {
      setHotkeyScopeAndMemorizePreviousScope(
        dropdownButtonCustomHotkeyScope.scope,
        dropdownButtonCustomHotkeyScope.customScopes,
      );
    }
    onDropdownToggle?.(true);
  }

  function toggleDropdownButton() {
    if (isDropdownButtonOpen) {
      closeDropdownButton();
    } else {
      openDropdownButton();
    }
    onDropdownToggle?.(isDropdownButtonOpen);
  }

  return {
    isDropdownButtonOpen,
    closeDropdownButton,
    toggleDropdownButton,
    openDropdownButton,
  };
}
