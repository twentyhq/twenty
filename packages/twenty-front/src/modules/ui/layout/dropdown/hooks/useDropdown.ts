import { useRecoilState } from 'recoil';

import { useDropdownScopedStates } from '@/ui/layout/dropdown/hooks/internal/useDropdownScopedStates';
import { getDropdownScopeInjectors } from '@/ui/layout/dropdown/utils/internal/getDropdownScopeInjectors';

export const useDropdown = (dropdownId?: string) => {
  const { injectStateWithDropdownScopeId, scopeId } = useDropdownScopedStates({
    dropdownScopeId: dropdownId,
  });

  const {
    dropdownHotkeyScopeScopeInjector,
    dropdownWidthScopeInjector,
    isDropdownOpenScopeInjector,
  } = getDropdownScopeInjectors();

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
    setIsDropdownOpen(false);
  };

  const openDropdown = () => {
    setIsDropdownOpen(true);
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
