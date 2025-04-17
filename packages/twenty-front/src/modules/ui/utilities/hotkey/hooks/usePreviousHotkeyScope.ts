import { useRecoilCallback } from 'recoil';

import { DEBUG_HOTKEY_SCOPE } from '@/ui/utilities/hotkey/hooks/useScopedHotkeyCallback';
import { logDebug } from '~/utils/logDebug';

import { currentHotkeyScopeState } from '../states/internal/currentHotkeyScopeState';
import { previousHotkeyScopeFamilyState } from '../states/internal/previousHotkeyScopeFamilyState';
import { CustomHotkeyScopes } from '../types/CustomHotkeyScope';

import { useSetHotkeyScope } from './useSetHotkeyScope';

export const usePreviousHotkeyScope = (memoizeKey = 'global') => {
  const setHotkeyScope = useSetHotkeyScope();

  const goBackToPreviousHotkeyScope = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const previousHotkeyScope = snapshot
          .getLoadable(previousHotkeyScopeFamilyState(memoizeKey))
          .getValue();

        if (!previousHotkeyScope) {
          if (DEBUG_HOTKEY_SCOPE) {
            logDebug(`DEBUG: no previous hotkey scope ${memoizeKey}`);
          }

          return;
        }

        if (DEBUG_HOTKEY_SCOPE) {
          logDebug(
            `DEBUG: goBackToPreviousHotkeyScope ${previousHotkeyScope.scope}`,
            previousHotkeyScope,
          );
        }

        setHotkeyScope(
          previousHotkeyScope.scope,
          previousHotkeyScope.customScopes,
        );

        set(previousHotkeyScopeFamilyState(memoizeKey), null);
      },
    [setHotkeyScope, memoizeKey],
  );

  const setHotkeyScopeAndMemorizePreviousScope = useRecoilCallback(
    ({ snapshot, set }) =>
      (scope: string, customScopes?: CustomHotkeyScopes) => {
        const currentHotkeyScope = snapshot
          .getLoadable(currentHotkeyScopeState)
          .getValue();

        if (DEBUG_HOTKEY_SCOPE) {
          logDebug('DEBUG: setHotkeyScopeAndMemorizePreviousScope', {
            currentHotkeyScope,
            scope,
            customScopes,
          });
        }

        setHotkeyScope(scope, customScopes);

        set(previousHotkeyScopeFamilyState(memoizeKey), currentHotkeyScope);
      },
    [setHotkeyScope, memoizeKey],
  );

  return {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  };
};
