import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { currentHotkeysScopeState } from '@/lib/hotkeys/states/internal/currentHotkeysScopeState';

import { AppHotkeyScope } from '../../types/AppHotkeyScope';

import { useHotkeysScopes } from './useHotkeysScopes';

export function useHotkeysScopeAutoSync() {
  const { setHotkeysScopes } = useHotkeysScopes();

  const currentHotkeysScope = useRecoilValue(currentHotkeysScopeState);

  useEffect(() => {
    const scopesToSet: string[] = [];

    if (currentHotkeysScope.customScopes?.commandMenu) {
      scopesToSet.push(AppHotkeyScope.CommandMenu);
    }

    if (currentHotkeysScope?.customScopes?.goto) {
      scopesToSet.push(AppHotkeyScope.Goto);
    }

    scopesToSet.push(currentHotkeysScope.scope);

    setHotkeysScopes(scopesToSet);
  }, [setHotkeysScopes, currentHotkeysScope]);
}
