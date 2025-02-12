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

        const activeDropdownFocusId = snapshot
          .getLoadable(activeDropdownFocusIdState)
          .getValue();

        if (activeDropdownFocusId === dropdownId) {
          return;
        }

        set(previousDropdownFocusIdState, focusedDropdownId);
        set(activeDropdownFocusIdState, dropdownId);
      },
    [],
  );

  return {
    setActiveDropdownFocusIdAndMemorizePrevious,
  };
};
