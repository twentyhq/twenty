import { useRecoilCallback } from 'recoil';

import { currentHotkeyScopeState } from '../states/internal/currentHotkeyScopeState';
import { previousHotkeyScopeState } from '../states/internal/previousHotkeyScopeState';
import { CustomHotkeyScopes } from '../types/CustomHotkeyScope';

import { useSetHotkeyScope } from './useSetHotkeyScope';

export const usePreviousHotkeyScope = () => {
  const setHotkeyScope = useSetHotkeyScope();

  const goBackToPreviousHotkeyScope = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const previousHotkeyScope = snapshot
          .getLoadable(previousHotkeyScopeState)
          .valueOrThrow();

        if (!previousHotkeyScope) {
          return;
        }

        setHotkeyScope(
          previousHotkeyScope.scope,
          previousHotkeyScope.customScopes,
        );

        set(previousHotkeyScopeState, null);
      },
    [setHotkeyScope],
  );

  const setHotkeyScopeAndMemorizePreviousScope = useRecoilCallback(
    ({ snapshot, set }) =>
      (scope: string, customScopes?: CustomHotkeyScopes) => {
        const currentHotkeyScope = snapshot
          .getLoadable(currentHotkeyScopeState)
          .valueOrThrow();

        setHotkeyScope(scope, customScopes);
        set(previousHotkeyScopeState, currentHotkeyScope);
      },
    [setHotkeyScope],
  );

  return {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  };
};
