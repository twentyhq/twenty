import { useRecoilCallback, useRecoilState } from 'recoil';

import { useDropdownStates } from '@/ui/layout/dropdown/hooks/internal/useDropdownStates';
import { useGoBackToPreviousDropdownFocusId } from '@/ui/layout/dropdown/hooks/useGoBackToPreviousDropdownFocusId';
import { useSetActiveDropdownFocusIdAndMemorizePrevious } from '@/ui/layout/dropdown/hooks/useSetFocusedDropdownIdAndMemorizePrevious';
import { dropdownHotkeyComponentState } from '@/ui/layout/dropdown/states/dropdownHotkeyComponentState';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useDropdown = (dropdownId?: string) => {
  const { scopeId, isDropdownOpenState, dropdownPlacementState } =
    useDropdownStates({
      dropdownScopeId: dropdownId,
    });

  const { setActiveDropdownFocusIdAndMemorizePrevious } =
    useSetActiveDropdownFocusIdAndMemorizePrevious();

  const { goBackToPreviousDropdownFocusId } =
    useGoBackToPreviousDropdownFocusId();

  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const [dropdownPlacement, setDropdownPlacement] = useRecoilState(
    dropdownPlacementState,
  );

  const [isDropdownOpen, setIsDropdownOpen] =
    useRecoilState(isDropdownOpenState);

  const closeDropdown = useCallback(() => {
    if (isDropdownOpen) {
      goBackToPreviousHotkeyScope();
      setIsDropdownOpen(false);
      goBackToPreviousDropdownFocusId();
    }
  }, [
    isDropdownOpen,
    goBackToPreviousHotkeyScope,
    setIsDropdownOpen,
    goBackToPreviousDropdownFocusId,
  ]);

  const openDropdown = useRecoilCallback(
    ({ snapshot }) =>
      (dropdownHotkeyScopeFromProps?: HotkeyScope) => {
        if (!isDropdownOpen) {
          setIsDropdownOpen(true);
          setActiveDropdownFocusIdAndMemorizePrevious(dropdownId ?? scopeId);

          const dropdownHotkeyScope = getSnapshotValue(
            snapshot,
            dropdownHotkeyComponentState({
              scopeId: dropdownId ?? scopeId,
            }),
          );

          const dropdownHotkeyScopeForOpening =
            dropdownHotkeyScopeFromProps ?? dropdownHotkeyScope;

          if (isDefined(dropdownHotkeyScopeForOpening)) {
            setHotkeyScopeAndMemorizePreviousScope(
              dropdownHotkeyScopeForOpening.scope,
              dropdownHotkeyScopeForOpening.customScopes,
            );
          }
        }
      },
    [
      isDropdownOpen,
      setIsDropdownOpen,
      setActiveDropdownFocusIdAndMemorizePrevious,
      dropdownId,
      scopeId,
      setHotkeyScopeAndMemorizePreviousScope,
    ],
  );

  const toggleDropdown = (dropdownHotkeyScopeFromProps?: HotkeyScope) => {
    if (isDropdownOpen) {
      closeDropdown();
    } else {
      openDropdown(dropdownHotkeyScopeFromProps);
    }
  };

  return {
    scopeId,
    isDropdownOpen,
    closeDropdown,
    toggleDropdown,
    openDropdown,
    dropdownPlacement,
    setDropdownPlacement,
  };
};
