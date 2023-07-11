import { useState } from 'react';
import { useRecoilValue } from 'recoil';

import { currentHotkeysScopeState } from '@/hotkeys/states/internal/currentHotkeysScopeState';
import { CustomHotkeysScopes } from '@/hotkeys/types/internal/CustomHotkeysScope';
import { HotkeysScope } from '@/hotkeys/types/internal/HotkeysScope';

import { useSetHotkeysScope } from '../useSetHotkeysScope';

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
    previousHotkeysScope,
    setHotkeysScopeAndMemorizePreviousScope,
    currentHotkeysScope,
    goBackToPreviousHotkeysScope,
  };
}
