import { useRecoilCallback } from 'recoil';

import { DEBUG_HOTKEY_SCOPE } from '@/ui/utilities/hotkey/hooks/useScopedHotkeyCallback';
import { logDebug } from '~/utils/logDebug';

import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { previousDropdownFocusIdState } from '@/ui/layout/dropdown/states/previousDropdownFocusIdState';

export const useSetFocusedDropdownIdAndMemorizePrevious = () => {
  const setFocusedDropdownIdAndMemorizePrevious = useRecoilCallback(
    ({ snapshot, set }) =>
      (dropdownId: string) => {
        const focusedDropdownId = snapshot
          .getLoadable(activeDropdownFocusIdState)
          .getValue();

        if (DEBUG_HOTKEY_SCOPE) {
          logDebug('DEBUG: setFocusedDropdownId', {
            focusedDropdownId,
            dropdownId,
          });
        }

        set(previousDropdownFocusIdState, focusedDropdownId);
        set(activeDropdownFocusIdState, dropdownId);
      },
    [],
  );

  return {
    setFocusedDropdownIdAndMemorizePrevious,
  };
};
