import { useRecoilCallback } from 'recoil';

import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { previousDropdownFocusIdState } from '@/ui/layout/dropdown/states/previousDropdownFocusIdState';
import { DEBUG_HOTKEY_SCOPE } from '@/ui/utilities/hotkey/hooks/useScopedHotkeyCallback';
import { logDebug } from '~/utils/logDebug';

export const useGoBackToPreviouslyFocusedDropdownId = () => {
  const goBackToPreviouslyFocusedDropdownId = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const previouslyFocusedDropdownId = snapshot
          .getLoadable(previousDropdownFocusIdState)
          .getValue();

        if (DEBUG_HOTKEY_SCOPE) {
          logDebug(
            'DEBUG: go back to previously focused dropdown id',
            previouslyFocusedDropdownId,
          );
        }

        set(activeDropdownFocusIdState, previouslyFocusedDropdownId);
        set(previousDropdownFocusIdState, null);
      },
    [],
  );

  return {
    goBackToPreviouslyFocusedDropdownId,
  };
};
