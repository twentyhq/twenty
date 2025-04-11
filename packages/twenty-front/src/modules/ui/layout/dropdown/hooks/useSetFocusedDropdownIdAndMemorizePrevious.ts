import { useRecoilCallback } from 'recoil';

import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { previousDropdownFocusIdState } from '@/ui/layout/dropdown/states/previousDropdownFocusIdState';

export const useSetActiveDropdownFocusIdAndMemorizePrevious = () => {
  const setActiveDropdownFocusIdAndMemorizePrevious = useRecoilCallback(
    ({ snapshot, set }) =>
      (dropdownId: string | null) => {
        const activeDropdownFocusId = snapshot
          .getLoadable(activeDropdownFocusIdState)
          .getValue();

        if (activeDropdownFocusId === dropdownId) {
          return;
        }

        set(previousDropdownFocusIdState, activeDropdownFocusId);
        set(activeDropdownFocusIdState, dropdownId);
      },
    [],
  );

  return {
    setActiveDropdownFocusIdAndMemorizePrevious,
  };
};
