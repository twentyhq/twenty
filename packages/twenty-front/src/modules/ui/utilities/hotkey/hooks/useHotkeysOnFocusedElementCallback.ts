import { DEBUG_FOCUS_STACK } from '@/ui/utilities/focus/constants/DebugFocusStack';
import {
  type Hotkey,
  type OptionsOrDependencyArray,
} from 'react-hotkeys-hook/dist/types';
import { useRecoilCallback } from 'recoil';
import { logDebug } from '~/utils/logDebug';
import { currentFocusIdSelector } from '@/ui/utilities/focus/states/currentFocusIdSelector';

export const useHotkeysOnFocusedElementCallback = (
  dependencies?: OptionsOrDependencyArray,
) => {
  const dependencyArray = Array.isArray(dependencies) ? dependencies : [];

  return useRecoilCallback(
    ({ snapshot }) =>
      ({
        callback,
        hotkeysEvent,
        keyboardEvent,
        focusId,
        preventDefault,
      }: {
        keyboardEvent: KeyboardEvent;
        hotkeysEvent: Hotkey;
        callback: (keyboardEvent: KeyboardEvent, hotkeysEvent: Hotkey) => void;
        focusId: string;
        preventDefault?: boolean;
      }) => {
        const currentFocusId = snapshot
          .getLoadable(currentFocusIdSelector)
          .getValue();

        if (currentFocusId !== focusId) {
          if (DEBUG_FOCUS_STACK) {
            logDebug(
              `DEBUG: %cI can't call hotkey (${
                hotkeysEvent.keys
              }) because I'm in [${focusId}] and the current focus identifier is [${currentFocusId}]`,
              'color: gray; ',
            );
          }

          return;
        }

        if (DEBUG_FOCUS_STACK) {
          logDebug(
            `DEBUG: %cI can call hotkey (${
              hotkeysEvent.keys
            }) because I'm in [${focusId}] and the current focus identifier is [${currentFocusId}]`,
            'color: green;',
          );
        }

        if (preventDefault === true) {
          if (DEBUG_FOCUS_STACK) {
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
