import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { currentHotkeysScopeState } from '@/lib/hotkeys/states/internal/currentHotkeysScopeState';
import { InternalHotkeysScope } from '@/lib/hotkeys/types/internal/InternalHotkeysScope';

import { useHotkeysScopes } from './useHotkeysScopes';

export function useHotkeysScopeAutoSync() {
  const { setHotkeysScopes } = useHotkeysScopes();

  const currentHotkeysScope = useRecoilValue(currentHotkeysScopeState);

  useEffect(() => {
    const scopesToSet: string[] = [];

    if (currentHotkeysScope.customScopes?.commandMenu) {
      scopesToSet.push(InternalHotkeysScope.CommandMenu);
    }

    if (currentHotkeysScope?.customScopes?.goto) {
      scopesToSet.push(InternalHotkeysScope.Goto);
    }

    scopesToSet.push(currentHotkeysScope.scope);

    setHotkeysScopes(scopesToSet);
  }, [setHotkeysScopes, currentHotkeysScope]);
}
