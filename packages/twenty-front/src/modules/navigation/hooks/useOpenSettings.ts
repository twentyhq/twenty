import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { currentMobileNavigationDrawerState } from '@/navigation/states/currentMobileNavigationDrawerState';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerExpandedMemorizedState } from '@/ui/navigation/states/navigationDrawerExpandedMemorizedState';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';

export const useOpenSettingsMenu = () => {
  const location = useLocation();
  const isSettingsPage = useIsSettingsPage();
  const [isNavigationDrawerExpanded, setIsNavigationDrawerExpanded] =
    useAtomState(isNavigationDrawerExpandedState);
  const setNavigationDrawerExpandedMemorized = useSetAtomState(
    navigationDrawerExpandedMemorizedState,
  );
  const setNavigationMemorizedUrl = useSetAtomState(
    navigationMemorizedUrlState,
  );
  const setCurrentMobileNavigationDrawer = useSetAtomState(
    currentMobileNavigationDrawerState,
  );

  const openSettingsMenu = useCallback(() => {
    if (isSettingsPage) {
      return;
    }

    setNavigationDrawerExpandedMemorized(isNavigationDrawerExpanded);
    setIsNavigationDrawerExpanded(true);
    setNavigationMemorizedUrl(location.pathname + location.search);
    setCurrentMobileNavigationDrawer('settings');
  }, [
    isSettingsPage,
    isNavigationDrawerExpanded,
    location.pathname,
    location.search,
    setCurrentMobileNavigationDrawer,
    setIsNavigationDrawerExpanded,
    setNavigationDrawerExpandedMemorized,
    setNavigationMemorizedUrl,
  ]);

  return { openSettingsMenu };
};
