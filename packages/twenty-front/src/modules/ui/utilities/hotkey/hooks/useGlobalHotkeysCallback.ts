import { DEBUG_FOCUS_STACK } from '@/ui/utilities/focus/constants/DebugFocusStack';
import { currentGlobalHotkeysConfigSelector } from '@/ui/utilities/focus/states/currentGlobalHotkeysConfigSelector';
import {
  type Hotkey,
  type OptionsOrDependencyArray,
} from 'react-hotkeys-hook/dist/types';
import { useRecoilCallback } from 'recoil';
import { logDebug } from '~/utils/logDebug';

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
      }: {
        keyboardEvent: KeyboardEvent;
        hotkeysEvent: Hotkey;
        containsModifier: boolean;
        callback: (keyboardEvent: KeyboardEvent, hotkeysEvent: Hotkey) => void;
        preventDefault?: boolean;
      }) => {
        const currentGlobalHotkeysConfig = snapshot
          .getLoadable(currentGlobalHotkeysConfigSelector)
          .getValue();

        if (
          containsModifier &&
          !currentGlobalHotkeysConfig.enableGlobalHotkeysWithModifiers
        ) {
          if (DEBUG_FOCUS_STACK) {
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
          if (DEBUG_FOCUS_STACK) {
            logDebug(
              `DEBUG: %cI can't call hotkey (${
                hotkeysEvent.keys
              }) because global hotkeys conflicting with keyboard are disabled`,
              'color: gray; ',
            );
          }
          return;
        }

        if (preventDefault === true) {
          if (DEBUG_FOCUS_STACK) {
            logDebug(
              `DEBUG: %cI prevent global default for hotkey (${hotkeysEvent.keys})`,
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
