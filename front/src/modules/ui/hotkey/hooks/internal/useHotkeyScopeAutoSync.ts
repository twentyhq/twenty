import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { currentHotkeyScopeState } from '@/ui/hotkey/states/internal/currentHotkeyScopeState';

import { AppHotkeyScope } from '../../types/AppHotkeyScope';

import { useHotkeyScopes } from './useHotkeyScopes';

export function useHotkeyScopeAutoSync() {
  const { setHotkeyScopes } = useHotkeyScopes();

  const currentHotkeyScope = useRecoilValue(currentHotkeyScopeState);

  useEffect(() => {
    const scopesToSet: string[] = [];

    if (currentHotkeyScope.customScopes?.commandMenu) {
      scopesToSet.push(AppHotkeyScope.CommandMenu);
    }

    if (currentHotkeyScope?.customScopes?.goto) {
      scopesToSet.push(AppHotkeyScope.Goto);
    }

    scopesToSet.push(currentHotkeyScope.scope);

    setHotkeyScopes(scopesToSet);
  }, [setHotkeyScopes, currentHotkeyScope]);
}
