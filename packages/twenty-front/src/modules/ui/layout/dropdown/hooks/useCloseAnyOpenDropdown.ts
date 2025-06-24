import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { previousDropdownFocusIdState } from '@/ui/layout/dropdown/states/previousDropdownFocusIdState';
import { useRemoveFocusItemFromFocusStack } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStack';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useCloseAnyOpenDropdown = () => {
  const { closeDropdown } = useCloseDropdown();

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
          closeDropdown(activeDropdownFocusId);
          removeFocusItemFromFocusStack({
            focusId: activeDropdownFocusId,
            memoizeKey: 'global',
          });
        }

        if (thereIsOneNestedDropdownOpen) {
          closeDropdown(previousDropdownFocusId);
          removeFocusItemFromFocusStack({
            focusId: previousDropdownFocusId,
            memoizeKey: 'global',
          });
        }

        set(previousDropdownFocusIdState, null);
        set(activeDropdownFocusIdState, null);
      },
    [closeDropdown, removeFocusItemFromFocusStack],
  );

  return { closeAnyOpenDropdown };
};
