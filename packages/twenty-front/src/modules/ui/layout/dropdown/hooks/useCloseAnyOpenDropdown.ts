import { useCloseDropdownFromOutside } from '@/ui/layout/dropdown/hooks/useCloseDropdownFromOutside';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { previousDropdownFocusIdState } from '@/ui/layout/dropdown/states/previousDropdownFocusIdState';
import { useRemoveFocusIdFromFocusStack } from '@/ui/utilities/focus/hooks/useRemoveFocusIdFromFocusStack';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useCloseAnyOpenDropdown = () => {
  const { closeDropdownFromOutside } = useCloseDropdownFromOutside();

  const { removeFocusIdFromFocusStack } = useRemoveFocusIdFromFocusStack();

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
          removeFocusIdFromFocusStack({
            focusId: activeDropdownFocusId,
            memoizeKey: 'global',
          });
        }

        if (thereIsOneNestedDropdownOpen) {
          closeDropdownFromOutside(previousDropdownFocusId);
          removeFocusIdFromFocusStack({
            focusId: previousDropdownFocusId,
            memoizeKey: 'global',
          });
        }

        set(previousDropdownFocusIdState, null);
        set(activeDropdownFocusIdState, null);
      },
    [closeDropdownFromOutside, removeFocusIdFromFocusStack],
  );

  return { closeAnyOpenDropdown };
};
