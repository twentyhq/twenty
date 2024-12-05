import { useRecoilState } from 'recoil';

import { useDropdownStates } from '@/ui/layout/dropdown/hooks/internal/useDropdownStates';
import { useGoBackToPreviousDropdownFocusId } from '@/ui/layout/dropdown/hooks/useGoBackToPreviousDropdownFocusId';
import { useSetActiveDropdownFocusIdAndMemorizePrevious } from '@/ui/layout/dropdown/hooks/useSetFocusedDropdownIdAndMemorizePrevious';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { getScopeIdOrUndefinedFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdOrUndefinedFromComponentId';
import { useCallback } from 'react';
import { isDefined } from '~/utils/isDefined';

export const useDropdown = (dropdownId?: string) => {
  const {
    scopeId,
    dropdownHotkeyScopeState,
    dropdownWidthState,
    isDropdownOpenState,
    dropdownPlacementState,
  } = useDropdownStates({
    dropdownScopeId: getScopeIdOrUndefinedFromComponentId(dropdownId),
  });

  const { setActiveDropdownFocusIdAndMemorizePrevious: setFocusedDropdownIdAndMemorizePrevious } =
    useSetActiveDropdownFocusIdAndMemorizePrevious();

  const { goBackToPreviousDropdownFocusId: goBackToPreviouslyFocusedDropdownId } =
    useGoBackToPreviousDropdownFocusId();

  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const [dropdownHotkeyScope] = useRecoilState(dropdownHotkeyScopeState);

  const [dropdownWidth, setDropdownWidth] = useRecoilState(dropdownWidthState);

  const [dropdownPlacement, setDropdownPlacement] = useRecoilState(
    dropdownPlacementState,
  );

  const [isDropdownOpen, setIsDropdownOpen] =
    useRecoilState(isDropdownOpenState);

  const closeDropdown = useCallback(() => {
    if (isDropdownOpen) {
      goBackToPreviousHotkeyScope();
      setIsDropdownOpen(false);
      goBackToPreviouslyFocusedDropdownId();
    }
  }, [
    isDropdownOpen,
    goBackToPreviousHotkeyScope,
    setIsDropdownOpen,
    goBackToPreviouslyFocusedDropdownId,
  ]);

  const openDropdown = () => {
    if (!isDropdownOpen) {
      setIsDropdownOpen(true);
      setFocusedDropdownIdAndMemorizePrevious(dropdownId ?? scopeId);
      if (isDefined(dropdownHotkeyScope)) {
        setHotkeyScopeAndMemorizePreviousScope(
          dropdownHotkeyScope.scope,
          dropdownHotkeyScope.customScopes,
        );
      }
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
    isDropdownOpen,
    closeDropdown,
    toggleDropdown,
    openDropdown,
    dropdownWidth,
    setDropdownWidth,
    dropdownPlacement,
    setDropdownPlacement,
  };
};
