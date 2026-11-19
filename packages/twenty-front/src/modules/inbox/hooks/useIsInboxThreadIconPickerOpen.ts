import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const useIsInboxThreadIconPickerOpen = (
  iconPickerDropdownId: string,
) => {
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    iconPickerDropdownId,
  );

  return isDropdownOpen;
};
