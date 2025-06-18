import { useRecoilCallback, useRecoilState } from 'recoil';

import { useDropdownStates } from '@/ui/layout/dropdown/hooks/internal/useDropdownStates';
import { useGoBackToPreviousDropdownFocusId } from '@/ui/layout/dropdown/hooks/useGoBackToPreviousDropdownFocusId';
import { useSetActiveDropdownFocusIdAndMemorizePrevious } from '@/ui/layout/dropdown/hooks/useSetFocusedDropdownIdAndMemorizePrevious';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusIdFromFocusStack } from '@/ui/utilities/focus/hooks/useRemoveFocusIdFromFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { GlobalHotkeysConfig } from '@/ui/utilities/hotkey/types/GlobalHotkeysConfig';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useCallback } from 'react';

export const useDropdown = (dropdownId?: string) => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusIdFromFocusStack } = useRemoveFocusIdFromFocusStack();

  const { scopeId, isDropdownOpenState, dropdownPlacementState } =
    useDropdownStates({ dropdownScopeId: dropdownId });

  const { setActiveDropdownFocusIdAndMemorizePrevious } =
    useSetActiveDropdownFocusIdAndMemorizePrevious();

  const { goBackToPreviousDropdownFocusId } =
    useGoBackToPreviousDropdownFocusId();

  const [isDropdownOpen, setIsDropdownOpen] =
    useRecoilState(isDropdownOpenState);

  const [dropdownPlacement, setDropdownPlacement] = useRecoilState(
    dropdownPlacementState,
  );

  const closeDropdown = useCallback(() => {
    if (isDropdownOpen) {
      setIsDropdownOpen(false);
      goBackToPreviousDropdownFocusId();
      removeFocusIdFromFocusStack({
        focusId: dropdownId ?? scopeId,
        memoizeKey: 'global',
      });
    }
  }, [
    isDropdownOpen,
    setIsDropdownOpen,
    goBackToPreviousDropdownFocusId,
    removeFocusIdFromFocusStack,
    dropdownId,
    scopeId,
  ]);

  const openDropdown = useRecoilCallback(
    () => (globalHotkeysConfig?: Partial<GlobalHotkeysConfig>) => {
      if (!isDropdownOpen) {
        setIsDropdownOpen(true);
        setActiveDropdownFocusIdAndMemorizePrevious(dropdownId ?? scopeId);

        pushFocusItemToFocusStack({
          focusId: dropdownId ?? scopeId,
          component: {
            type: FocusComponentType.DROPDOWN,
            instanceId: dropdownId ?? scopeId,
          },
          globalHotkeysConfig,
          // TODO: Remove this once we've fully migrated away from hotkey scopes
          hotkeyScope: { scope: 'dropdown' } as HotkeyScope,
          memoizeKey: 'global',
        });
      }
    },
    [
      isDropdownOpen,
      setIsDropdownOpen,
      setActiveDropdownFocusIdAndMemorizePrevious,
      pushFocusItemToFocusStack,
      dropdownId,
      scopeId,
    ],
  );

  const toggleDropdown = (
    globalHotkeysConfig?: Partial<GlobalHotkeysConfig>,
  ) => {
    if (isDropdownOpen) {
      closeDropdown();
    } else {
      openDropdown(globalHotkeysConfig);
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
