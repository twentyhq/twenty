import { useEffect } from 'react';

import { AppFocus } from '../types/AppFocus';

import { useRemoveAppFocus } from './useRemoveAppFocus';
import { useSwitchToAppFocus } from './useSwitchToAppFocus';

export function useAppFocusOnBooleanState(
  appFocus: AppFocus,
  booleanState: boolean,
) {
  const switchToAppFocus = useSwitchToAppFocus();
  const removeAppFocus = useRemoveAppFocus();

  useEffect(() => {
    if (booleanState) {
      switchToAppFocus(appFocus);
    } else {
      removeAppFocus(appFocus);
    }
  }, [appFocus, removeAppFocus, switchToAppFocus, booleanState]);
}
