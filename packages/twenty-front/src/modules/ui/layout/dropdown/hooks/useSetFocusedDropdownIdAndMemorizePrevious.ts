import { useRecoilCallback } from 'recoil';

import { DEBUG_HOTKEY_SCOPE } from '@/ui/utilities/hotkey/hooks/useScopedHotkeyCallback';
import { logDebug } from '~/utils/logDebug';

import { focusedDropdownIdState } from '@/ui/layout/dropdown/states/focusedDropdownIdState';
import { previouslyFocusedDropdownIdState } from '@/ui/layout/dropdown/states/previouslyFocusedDropdownIdState';

export const useSetFocusedDropdownIdAndMemorizePrevious = () => {
  const setFocusedDropdownIdAndMemorizePrevious = useRecoilCallback(
    ({ snapshot, set }) =>
      (dropdownId: string) => {
        const focusedDropdownId = snapshot
          .getLoadable(focusedDropdownIdState)
          .getValue();

        if (DEBUG_HOTKEY_SCOPE) {
          logDebug('DEBUG: setFocusedDropdownId', {
            focusedDropdownId,
            dropdownId,
          });
        }

        set(previouslyFocusedDropdownIdState, focusedDropdownId);
        set(focusedDropdownIdState, dropdownId);
      },
    [],
  );

  return {
    setFocusedDropdownIdAndMemorizePrevious,
  };
};
