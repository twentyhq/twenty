import { useState } from 'react';
import { useRecoilCallback } from 'recoil';

import { currentHotkeyScopeState } from '../states/internal/currentHotkeyScopeState';
import { CustomHotkeyScopes } from '../types/CustomHotkeyScope';
import { HotkeyScope } from '../types/HotkeyScope';

import { useSetHotkeyScope } from './useSetHotkeyScope';

export function usePreviousHotkeyScope() {
  const [previousHotkeyScope, setPreviousHotkeyScope] =
    useState<HotkeyScope | null>();

  const setHotkeyScope = useSetHotkeyScope();

  function goBackToPreviousHotkeyScope() {
    if (previousHotkeyScope) {
      setHotkeyScope(
        previousHotkeyScope.scope,
        previousHotkeyScope.customScopes,
      );
    }
  }

  const setHotkeyScopeAndMemorizePreviousScope = useRecoilCallback(
    ({ snapshot }) =>
      (scope: string, customScopes?: CustomHotkeyScopes) => {
        const currentHotkeyScope = snapshot
          .getLoadable(currentHotkeyScopeState)
          .valueOrThrow();

        setHotkeyScope(scope, customScopes);
        setPreviousHotkeyScope(currentHotkeyScope);
      },
    [setPreviousHotkeyScope],
  );

  return {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  };
}
