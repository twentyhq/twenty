import { useCallback } from 'react';

import { AppFocus } from '@/app-focus/types/AppFocus';

import {
  ALWAYS_ON_HOTKEYS_SCOPES,
  APP_FOCUS_TO_HOTKEYS_SCOPES,
  HOTKEYS_SCOPES_NOT_ALWAYS_ON,
} from '../constants';

import { useHotkeysScope } from './useHotkeysScope';

export function useChangeHotkeysScopesToMatchAppFocus() {
  const { enableScope, disableScope } = useHotkeysScope();

  return useCallback(
    (newAppFocus: AppFocus) => {
      const hotkeysScope = APP_FOCUS_TO_HOTKEYS_SCOPES[newAppFocus];

      for (const hotkeysToDisable of HOTKEYS_SCOPES_NOT_ALWAYS_ON) {
        disableScope(hotkeysToDisable);
      }

      for (const alwaysOnHotkey of ALWAYS_ON_HOTKEYS_SCOPES) {
        enableScope(alwaysOnHotkey);
      }

      for (const hotkeysToEnable of hotkeysScope) {
        enableScope(hotkeysToEnable);
      }
    },
    [enableScope, disableScope],
  );
}
