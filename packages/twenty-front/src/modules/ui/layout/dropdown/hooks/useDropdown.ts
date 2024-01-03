import { useRecoilState } from 'recoil';

import { useDropdownScopedStates } from '@/ui/layout/dropdown/hooks/internal/useDropdownScopedStates';
import { getDropdownScopeInjectors } from '@/ui/layout/dropdown/utils/internal/getDropdownScopeInjectors';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';

export const useDropdown = (dropdownId?: string) => {
  const { injectStateWithDropdownScopeId, scopeId } = useDropdownScopedStates({
    dropdownScopeId: dropdownId,
  });

  const {
    dropdownHotkeyScopeScopeInjector,
    dropdownWidthScopeInjector,
    isDropdownOpenScopeInjector,
  } = getDropdownScopeInjectors();

  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const [dropdownHotkeyScope, setDropdownHotkeyScope] = useRecoilState(
    injectStateWithDropdownScopeId(dropdownHotkeyScopeScopeInjector),
  );

  const [dropdownWidth, setDropdownWidth] = useRecoilState(
    injectStateWithDropdownScopeId(dropdownWidthScopeInjector),
  );

  const [isDropdownOpen, setIsDropdownOpen] = useRecoilState(
    injectStateWithDropdownScopeId(isDropdownOpenScopeInjector),
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
    dropdownHotkeyScope,
    setDropdownHotkeyScope,
    dropdownWidth,
    setDropdownWidth,
  };
};
