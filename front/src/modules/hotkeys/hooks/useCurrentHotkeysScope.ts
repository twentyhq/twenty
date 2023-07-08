import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { hotkeysScopeStackState } from '../states/internal/hotkeysScopeStackState';

export function useCurrentHotkeysScope() {
  const hotkeysScopeStack = useRecoilValue(hotkeysScopeStackState);

  return useMemo(() => {
    if (hotkeysScopeStack.length === 0) {
      return null;
    } else {
      return hotkeysScopeStack[hotkeysScopeStack.length - 1];
    }
  }, [hotkeysScopeStack]);
}
