import { useEffect } from 'react';

import { AppFocus } from '../types/AppFocus';

import { useRemoveAppFocus } from './useRemoveAppFocus';
import { useSwitchToAppFocus } from './useSwitchToAppFocus';

export function useAppFocusDuringMount(appFocus: AppFocus) {
  const switchToAppFocus = useSwitchToAppFocus();
  const removeAppFocus = useRemoveAppFocus();

  useEffect(() => {
    switchToAppFocus(appFocus);

    return () => {
      removeAppFocus(appFocus);
    };
  }, [appFocus, removeAppFocus, switchToAppFocus]);
}
