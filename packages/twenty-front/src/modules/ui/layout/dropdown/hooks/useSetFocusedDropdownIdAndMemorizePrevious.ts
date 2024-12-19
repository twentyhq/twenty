import { useRecoilCallback } from 'recoil';

import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { previousDropdownFocusIdState } from '@/ui/layout/dropdown/states/previousDropdownFocusIdState';

export const useSetActiveDropdownFocusIdAndMemorizePrevious = () => {
  const setActiveDropdownFocusIdAndMemorizePrevious = useRecoilCallback(
    ({ snapshot, set }) =>
      (dropdownId: string | null) => {
        const focusedDropdownId = snapshot
          .getLoadable(activeDropdownFocusIdState)
          .getValue();

        set(previousDropdownFocusIdState, focusedDropdownId);
        set(activeDropdownFocusIdState, dropdownId);
      },
    [],
  );

  return {
    setActiveDropdownFocusIdAndMemorizePrevious,
  };
};
