import { useRecoilCallback } from 'recoil';

import { DEBUG_HOTKEY_SCOPE } from '@/ui/utilities/hotkey/hooks/useScopedHotkeyCallback';
import { logDebug } from '~/utils/logDebug';

import { currentHotkeyScopeState } from '../states/internal/currentHotkeyScopeState';
import { previousHotkeyScopeState } from '../states/internal/previousHotkeyScopeState';
import { CustomHotkeyScopes } from '../types/CustomHotkeyScope';

import { useSetHotkeyScope } from './useSetHotkeyScope';

export const usePreviousHotkeyScope = () => {
  const setHotkeyScope = useSetHotkeyScope();

  const goBackToPreviousHotkeyScope = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const previousHotkeyScope = snapshot
          .getLoadable(previousHotkeyScopeState)
          .getValue();

        if (!previousHotkeyScope) {
          return;
        }

        if (DEBUG_HOTKEY_SCOPE) {
          logDebug('DEBUG: goBackToPreviousHotkeyScope', previousHotkeyScope);
        }

        setHotkeyScope(
          previousHotkeyScope.scope,
          previousHotkeyScope.customScopes,
        );

        set(previousHotkeyScopeState, null);
      },
    [setHotkeyScope],
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
        set(previousHotkeyScopeState, currentHotkeyScope);
      },
    [setHotkeyScope],
  );

  return {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  };
};
