import { useCloseDropdownFromOutside } from '@/ui/layout/dropdown/hooks/useCloseDropdownFromOutside';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { previousDropdownFocusIdState } from '@/ui/layout/dropdown/states/previousDropdownFocusIdState';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useCloseAnyOpenDropdown = () => {
  const { closeDropdownFromOutside } = useCloseDropdownFromOutside();

  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

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
          removeFocusItemFromFocusStackById({
            focusId: activeDropdownFocusId,
          });
        }

        if (thereIsOneNestedDropdownOpen) {
          closeDropdownFromOutside(previousDropdownFocusId);
          removeFocusItemFromFocusStackById({
            focusId: previousDropdownFocusId,
          });
        }

        set(previousDropdownFocusIdState, null);
        set(activeDropdownFocusIdState, null);
      },
    [closeDropdownFromOutside, removeFocusItemFromFocusStackById],
  );

  return { closeAnyOpenDropdown };
};
