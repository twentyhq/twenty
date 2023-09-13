import { useEffect } from 'react';

import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useRecoilScopedFamilyState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedFamilyState';

import { dropdownButtonCustomHotkeyScopeScopedFamilyState } from '../states/dropdownButtonCustomHotkeyScopeScopedFamilyState';
import { isDropdownButtonOpenScopedFamilyState } from '../states/isDropdownButtonOpenScopedFamilyState';
import { DropdownRecoilScopeContext } from '../states/recoil-scope-contexts/DropdownRecoilScopeContext';

export function useDropdownButton({
  dropdownId,
  onDropdownToggle,
}: {
  dropdownId: string;
  // TODO: find another way to implement this because it won't be triggered if the hook is called from another place
  onDropdownToggle?: (isDropdownButtonOpen: boolean) => void;
}) {
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

  const [dropdownButtonCustomHotkeyScope] = useRecoilScopedFamilyState(
    dropdownButtonCustomHotkeyScopeScopedFamilyState,
    dropdownId,
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

  useEffect(() => {
    onDropdownToggle?.(isDropdownButtonOpen);
  }, [onDropdownToggle, isDropdownButtonOpen]);

  return {
    isDropdownButtonOpen,
    closeDropdownButton,
    toggleDropdownButton,
    openDropdownButton,
  };
}
