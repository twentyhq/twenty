import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { customHotkeysScopesState } from '@/hotkeys/states/internal/customHotkeysScopesState';
import { hotkeysScopeStackState } from '@/hotkeys/states/internal/hotkeysScopeStackState';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';

import { useHotkeysScope } from './useHotkeysScope';

export function useHotkeysScopeStackAutoSync() {
  const { setHotkeysScopes } = useHotkeysScope();

  const hotkeysScopeStack = useRecoilValue(hotkeysScopeStackState);
  const customHotkeysScopes = useRecoilValue(customHotkeysScopesState);

  useEffect(() => {
    if (hotkeysScopeStack.length === 0) {
      return;
    }

    const scopesToSet: string[] = [];

    const currentHotkeysScope = hotkeysScopeStack[hotkeysScopeStack.length - 1];

    if (currentHotkeysScope.customScopes?.['command-menu']) {
      scopesToSet.push(InternalHotkeysScope.CommandMenu);
    }

    if (currentHotkeysScope?.customScopes?.goto) {
      scopesToSet.push(InternalHotkeysScope.Goto);
    }

    scopesToSet.push(currentHotkeysScope.scope);

    console.log(
      JSON.stringify({
        scopesToSet,
        hotkeysScopeStack,
      }),
    );

    setHotkeysScopes(scopesToSet);
  }, [setHotkeysScopes, customHotkeysScopes, hotkeysScopeStack]);
}
