import { useState } from 'react';
import { useRecoilValue } from 'recoil';

import { currentHotkeysScopeState } from '../states/internal/currentHotkeysScopeState';
import { CustomHotkeysScopes } from '../types/CustomHotkeysScope';
import { HotkeysScope } from '../types/HotkeysScope';

import { useSetHotkeysScope } from './useSetHotkeysScope';

export function usePreviousHotkeysScope() {
  const [previousHotkeysScope, setPreviousHotkeysScope] =
    useState<HotkeysScope | null>();

  const setHotkeysScope = useSetHotkeysScope();

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
    customScopes?: CustomHotkeysScopes,
  ) {
    setPreviousHotkeysScope(currentHotkeysScope);
    setHotkeysScope(scope, customScopes);
  }

  return {
    setHotkeysScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeysScope,
  };
}
