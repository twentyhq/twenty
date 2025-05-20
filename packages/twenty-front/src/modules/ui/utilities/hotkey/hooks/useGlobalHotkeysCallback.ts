import { currentGlobalHotkeysConfigSelector } from '@/ui/utilities/focus/states/currentGlobalHotkeysConfigSelector';
import { internalHotkeysEnabledScopesState } from '@/ui/utilities/hotkey/states/internal/internalHotkeysEnabledScopesState';
import {
  Hotkey,
  OptionsOrDependencyArray,
} from 'react-hotkeys-hook/dist/types';
import { useRecoilCallback } from 'recoil';
import { logDebug } from '~/utils/logDebug';
import { DEBUG_HOTKEY_SCOPE } from '../constants/DebugHotkeyScope';

export const useGlobalHotkeysCallback = (
  dependencies?: OptionsOrDependencyArray,
) => {
  const dependencyArray = Array.isArray(dependencies) ? dependencies : [];

  return useRecoilCallback(
    ({ snapshot }) =>
      ({
        callback,
        containsModifier,
        hotkeysEvent,
        keyboardEvent,
        preventDefault,
        scope,
      }: {
        keyboardEvent: KeyboardEvent;
        hotkeysEvent: Hotkey;
        containsModifier: boolean;
        callback: (keyboardEvent: KeyboardEvent, hotkeysEvent: Hotkey) => void;
        preventDefault?: boolean;
        scope: string;
      }) => {
        // TODO: Remove this once we've migrated hotkey scopes to the new api
        const currentHotkeyScopes = snapshot
          .getLoadable(internalHotkeysEnabledScopesState)
          .getValue();

        const currentGlobalHotkeysConfig = snapshot
          .getLoadable(currentGlobalHotkeysConfigSelector)
          .getValue();

        if (
          containsModifier &&
          !currentGlobalHotkeysConfig.enableGlobalHotkeysWithModifiers
        ) {
          if (DEBUG_HOTKEY_SCOPE) {
            logDebug(
              `DEBUG: %cI can't call hotkey (${
                hotkeysEvent.keys
              }) because global hotkeys with modifiers are disabled`,
              'color: gray; ',
            );
          }

          return;
        }

        if (
          !containsModifier &&
          !currentGlobalHotkeysConfig.enableGlobalHotkeysConflictingWithKeyboard
        ) {
          if (DEBUG_HOTKEY_SCOPE) {
            logDebug(
              `DEBUG: %cI can't call hotkey (${
                hotkeysEvent.keys
              }) because global hotkeys conflicting with keyboard are disabled`,
              'color: gray; ',
            );
          }
          return;
        }

        // TODO: Remove this once we've migrated hotkey scopes to the new api
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

        // TODO: Remove this once we've migrated hotkey scopes to the new api
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
