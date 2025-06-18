import { useCloseDropdownFromOutside } from '@/ui/layout/dropdown/hooks/useCloseDropdownFromOutside';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { previousDropdownFocusIdState } from '@/ui/layout/dropdown/states/previousDropdownFocusIdState';
import { useRemoveFocusItemFromFocusStack } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStack';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useCloseAnyOpenDropdown = () => {
  const { closeDropdownFromOutside } = useCloseDropdownFromOutside();

  const { removeFocusItemFromFocusStack } = useRemoveFocusItemFromFocusStack();

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
          removeFocusItemFromFocusStack({
            focusId: activeDropdownFocusId,
            memoizeKey: 'global',
          });
        }

        if (thereIsOneNestedDropdownOpen) {
          closeDropdownFromOutside(previousDropdownFocusId);
          removeFocusItemFromFocusStack({
            focusId: previousDropdownFocusId,
            memoizeKey: 'global',
          });
        }

        set(previousDropdownFocusIdState, null);
        set(activeDropdownFocusIdState, null);
      },
    [closeDropdownFromOutside, removeFocusItemFromFocusStack],
  );

  return { closeAnyOpenDropdown };
};
