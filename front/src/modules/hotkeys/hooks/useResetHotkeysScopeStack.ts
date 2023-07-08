import { useResetRecoilState } from 'recoil';

import { hotkeysScopeStackState } from '../states/internal/hotkeysScopeStackState';

import { useAddToHotkeysScopeStack } from './useAddToHotkeysScopeStack';

export function useResetHotkeysScopeStack() {
  const resetHotkeysScopeStack = useResetRecoilState(hotkeysScopeStackState);
  const addHotkeysScopedStack = useAddToHotkeysScopeStack();

  return function reset(toFirstScope?: string) {
    resetHotkeysScopeStack();

    if (toFirstScope) {
      addHotkeysScopedStack({ scope: toFirstScope });
    }
  };
}
