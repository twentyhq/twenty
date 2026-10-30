import { useCallback } from 'react';

import { PageFocusId } from '@/types/PageFocusId';
import { DEBUG_FOCUS_STACK } from '@/ui/utilities/focus/constants/DebugFocusStack';
import { currentGlobalHotkeysConfigSelector } from '@/ui/utilities/focus/states/currentGlobalHotkeysConfigSelector';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { isKeyboardEventComposing } from '@/ui/utilities/hotkey/utils/isKeyboardEventComposing';
import { useStore } from 'jotai';
import { Key } from 'ts-key-enum';
import {
  type Hotkey,
  type OptionsOrDependencyArray,
} from 'react-hotkeys-hook/dist/types';
import { logDebug } from '~/utils/logDebug';

export const useGlobalHotkeysCallback = (
  dependencies?: OptionsOrDependencyArray,
) => {
  const store = useStore();

  const dependencyArray = Array.isArray(dependencies) ? dependencies : [];

  return useCallback(
    ({
      callback,
      containsModifier,
      hotkeysEvent,
      keyboardEvent,
      preventDefault,
      enableOnSettingsPage,
    }: {
      keyboardEvent: KeyboardEvent;
      hotkeysEvent: Hotkey;
      containsModifier: boolean;
      callback: (keyboardEvent: KeyboardEvent, hotkeysEvent: Hotkey) => void;
      preventDefault?: boolean;
      enableOnSettingsPage?: boolean;
    }) => {
      const currentGlobalHotkeysConfig = store.get(
        currentGlobalHotkeysConfigSelector.atom,
      );

      const isEnabledOnSettingsPage =
        enableOnSettingsPage === true &&
        store.get(focusStackState.atom).at(-1)?.focusId ===
          PageFocusId.Settings;

      if (
        containsModifier &&
        !currentGlobalHotkeysConfig.enableGlobalHotkeysWithModifiers &&
        !isEnabledOnSettingsPage
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

      const isAllowedGlobalEscapeHotkey =
        currentGlobalHotkeysConfig.enableGlobalEscapeHotkeysConflictingWithKeyboard ===
          true &&
        keyboardEvent.key === Key.Escape &&
        !isKeyboardEventComposing(keyboardEvent);

      if (
        !containsModifier &&
        !currentGlobalHotkeysConfig.enableGlobalHotkeysConflictingWithKeyboard &&
        !isAllowedGlobalEscapeHotkey &&
        !isEnabledOnSettingsPage
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
    // oxlint-disable-next-line react-hooks/exhaustive-deps
    [...dependencyArray, store],
  );
};
