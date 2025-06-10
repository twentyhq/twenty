import { useCloseDropdownFromOutside } from '@/ui/layout/dropdown/hooks/useCloseDropdownFromOutside';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { previousDropdownFocusIdState } from '@/ui/layout/dropdown/states/previousDropdownFocusIdState';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useCloseAnyOpenDropdown = () => {
  const { goBackToPreviousHotkeyScope } = usePreviousHotkeyScope();

  const { closeDropdownFromOutside } = useCloseDropdownFromOutside();

  const closeAnyOpenDropdown = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const previousDropdownFocusId = snapshot
          .getLoadable(previousDropdownFocusIdState)
          .getValue();

        const activeDropdownFocusId = snapshot
          .getLoadable(activeDropdownFocusIdState)
          .getValue();

        const thereIsNoDropdownOpen =
          !isDefined(activeDropdownFocusId) &&
          !isDefined(previousDropdownFocusId);

        if (thereIsNoDropdownOpen) {
          return;
        }

        const thereIsOneNestedDropdownOpen = isDefined(previousDropdownFocusId);

        if (isDefined(activeDropdownFocusId)) {
          closeDropdownFromOutside(activeDropdownFocusId);
        }

        if (thereIsOneNestedDropdownOpen) {
          closeDropdownFromOutside(previousDropdownFocusId);
        }

        set(previousDropdownFocusIdState, null);
        set(activeDropdownFocusIdState, null);

        goBackToPreviousHotkeyScope();
      },
    [closeDropdownFromOutside, goBackToPreviousHotkeyScope],
  );

  return { closeAnyOpenDropdown };
};
