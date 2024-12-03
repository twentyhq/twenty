import { useRecoilCallback } from 'recoil';

import { focusedDropdownIdState } from '@/ui/layout/dropdown/states/focusedDropdownIdState';
import { previouslyFocusedDropdownIdState } from '@/ui/layout/dropdown/states/previouslyFocusedDropdownIdState';
import { DEBUG_HOTKEY_SCOPE } from '@/ui/utilities/hotkey/hooks/useScopedHotkeyCallback';
import { logDebug } from '~/utils/logDebug';

export const useGoBackToPreviouslyFocusedDropdownId = () => {
  const goBackToPreviouslyFocusedDropdownId = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const previouslyFocusedDropdownId = snapshot
          .getLoadable(previouslyFocusedDropdownIdState)
          .getValue();

        if (DEBUG_HOTKEY_SCOPE) {
          logDebug(
            'DEBUG: go back to previously focused dropdown id',
            previouslyFocusedDropdownId,
          );
        }

        set(focusedDropdownIdState, previouslyFocusedDropdownId);
        set(previouslyFocusedDropdownIdState, null);
      },
    [],
  );

  return {
    goBackToPreviouslyFocusedDropdownId,
  };
};
