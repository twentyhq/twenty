import {
  Hotkey,
  OptionsOrDependencyArray,
} from 'react-hotkeys-hook/dist/types';
import { useRecoilCallback } from 'recoil';

import { logDebug } from '~/utils/logDebug';

import { internalHotkeysEnabledScopesState } from '../states/internal/internalHotkeysEnabledScopesState';

export const DEBUG_HOTKEY_SCOPE = false;

export const useScopedHotkeyCallback = (
  dependencies?: OptionsOrDependencyArray,
) => {
  const dependencyArray = Array.isArray(dependencies) ? dependencies : [];

  return useRecoilCallback(
    ({ snapshot }) =>
      ({
        callback,
        hotkeysEvent,
        keyboardEvent,
        scope,
        preventDefault,
      }: {
        keyboardEvent: KeyboardEvent;
        hotkeysEvent: Hotkey;
        callback: (keyboardEvent: KeyboardEvent, hotkeysEvent: Hotkey) => void;
        scope: string;
        preventDefault?: boolean;
      }) => {
        const currentHotkeyScopes = snapshot
          .getLoadable(internalHotkeysEnabledScopesState)
          .getValue();

        if (!currentHotkeyScopes.includes(scope)) {
          if (DEBUG_HOTKEY_SCOPE) {
            logDebug(
              `DEBUG: %cI can't call hotkey (${
                hotkeysEvent.keys
              }) because I'm in scope [${scope}] and the active scopes are : [${currentHotkeyScopes.join(
                ', ',
              )}]`,
              'color: gray; ',
            );
          }

          return;
        }

        if (DEBUG_HOTKEY_SCOPE) {
          logDebug(
            `DEBUG: %cI can call hotkey (${
              hotkeysEvent.keys
            }) because I'm in scope [${scope}] and the active scopes are : [${currentHotkeyScopes.join(
              ', ',
            )}]`,
            'color: green;',
          );
        }

        if (preventDefault === true) {
          if (DEBUG_HOTKEY_SCOPE) {
            logDebug(
              `DEBUG: %cI prevent default for hotkey (${hotkeysEvent.keys})`,
              'color: gray;',
            );
          }

          keyboardEvent.stopPropagation();
          keyboardEvent.preventDefault();
          keyboardEvent.stopImmediatePropagation();
        }

        return callback(keyboardEvent, hotkeysEvent);
      },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencyArray,
  );
};
