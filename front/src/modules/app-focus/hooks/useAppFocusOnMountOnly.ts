import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { appFocusHistoryState } from '../states/appFocusHistoryState';
import { AppFocus } from '../types/AppFocus';

import { useSwitchToAppFocus } from './useSwitchToAppFocus';

export function useAppFocusOnMountOnly(appFocus: AppFocus) {
  const switchToAppFocus = useSwitchToAppFocus();

  const [appFocusHistory] = useRecoilState(appFocusHistoryState);

  const appFocusAlreadyInHistory = appFocusHistory.includes(appFocus);

  useEffect(() => {
    if (!appFocusAlreadyInHistory) {
      switchToAppFocus(appFocus);
    }
  }, [switchToAppFocus, appFocus, appFocusAlreadyInHistory]);
}
