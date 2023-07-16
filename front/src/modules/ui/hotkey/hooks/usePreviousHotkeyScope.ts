import { useState } from 'react';
import { useRecoilValue } from 'recoil';

import { currentHotkeyScopeState } from '../states/internal/currentHotkeyScopeState';
import { CustomHotkeyScopes } from '../types/CustomHotkeyScope';
import { HotkeyScope } from '../types/HotkeyScope';

import { useSetHotkeyScope } from './useSetHotkeyScope';

export function usePreviousHotkeyScope() {
  const [previousHotkeyScope, setPreviousHotkeyScope] =
    useState<HotkeyScope | null>();

  const setHotkeyScope = useSetHotkeyScope();

  const currentHotkeyScope = useRecoilValue(currentHotkeyScopeState);

  function goBackToPreviousHotkeyScope() {
    if (previousHotkeyScope) {
      setHotkeyScope(
        previousHotkeyScope.scope,
        previousHotkeyScope.customScopes,
      );
    }
  }

  function setHotkeyScopeAndMemorizePreviousScope(
    scope: string,
    customScopes?: CustomHotkeyScopes,
  ) {
    setPreviousHotkeyScope(currentHotkeyScope);
    setHotkeyScope(scope, customScopes);
  }

  return {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  };
}
