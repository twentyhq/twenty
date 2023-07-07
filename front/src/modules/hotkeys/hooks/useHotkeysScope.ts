import { useCallback } from 'react';
import { useHotkeysContext } from 'react-hotkeys-hook';

import { HotkeysScope } from '../types/HotkeysScope';

export function useHotkeysScope() {
  const { disableScope, enableScope } = useHotkeysContext();

  const disableScopeMemoized = useCallback(
    (scope: HotkeysScope) => {
      disableScope(scope);
    },
    [disableScope],
  );

  const enableScopeMemoized = useCallback(
    (scope: HotkeysScope) => {
      enableScope(scope);
    },
    [enableScope],
  );

  return {
    disableScope: disableScopeMemoized,
    enableScope: enableScopeMemoized,
  };
}
