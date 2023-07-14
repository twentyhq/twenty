import { useState } from 'react';
import { useRecoilValue } from 'recoil';

import { currentHotkeysScopeState } from '../states/internal/currentHotkeysScopeState';
import { CustomHotkeyScopes } from '../types/CustomHotkeyScope';
import { HotkeyScope } from '../types/HotkeyScope';

import { useSetHotkeyScope } from './useSetHotkeyScope';

export function usePreviousHotkeysScope() {
  const [previousHotkeysScope, setPreviousHotkeysScope] =
    useState<HotkeyScope | null>();

  const setHotkeysScope = useSetHotkeyScope();

  const currentHotkeysScope = useRecoilValue(currentHotkeysScopeState);

  function goBackToPreviousHotkeysScope() {
    if (previousHotkeysScope) {
      setHotkeysScope(
        previousHotkeysScope.scope,
        previousHotkeysScope.customScopes,
      );
    }
  }

  function setHotkeysScopeAndMemorizePreviousScope(
    scope: string,
    customScopes?: CustomHotkeyScopes,
  ) {
    setPreviousHotkeysScope(currentHotkeysScope);
    setHotkeysScope(scope, customScopes);
  }

  return {
    setHotkeysScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeysScope,
  };
}
