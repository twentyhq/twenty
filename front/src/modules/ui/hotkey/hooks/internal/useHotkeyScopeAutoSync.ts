import { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { currentHotkeyScopeState } from '@/ui/hotkey/states/internal/currentHotkeyScopeState';

import { isInitializingHotkeyScopeState } from '../../../states/isInitializingHotkeyScopeState';
import { AppHotkeyScope } from '../../types/AppHotkeyScope';

import { useHotkeyScopes } from './useHotkeyScopes';

export function useHotkeyScopeAutoSync() {
  const { setHotkeyScopes } = useHotkeyScopes();

  const currentHotkeyScope = useRecoilValue(currentHotkeyScopeState);

  const [isInitializingHotkeyScope, setIsInitializingHotkeyScope] =
    useRecoilState(isInitializingHotkeyScopeState);

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

    console.log(
      'useEffect useHotkeyScopeAutoSync',
      JSON.stringify({
        currentHotkeyScope,
        scopesToSet,
        isInitializingHotkeyScope,
      }),
    );

    // console.log('useEffect', { isLoadingPage });

    // if (isInitializingHotkeyScope) {
    //   // setCurrentPageLocation(location);
    //   // setIsInitializingPage(false);
    // }
  }, [
    setHotkeyScopes,
    currentHotkeyScope,
    isInitializingHotkeyScope,
    // setIsInitializingPage,
    // isLoadingPage,
    // isInitializingHotkeyScope,
  ]);
}
