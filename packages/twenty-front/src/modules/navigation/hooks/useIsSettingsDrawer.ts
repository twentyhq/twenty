import { useLocation } from 'react-router-dom';

import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { currentMobileNavigationDrawerState } from '@/navigation/states/currentMobileNavigationDrawerState';
import { settingsPathOpenedFromNavigationMenuState } from '@/navigation/states/settingsPathOpenedFromNavigationMenuState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsMobile } from 'twenty-ui/utilities';

export const useIsSettingsDrawer = () => {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const isSettingsPage = useIsSettingsPage();
  const currentMobileNavigationDrawer = useAtomStateValue(
    currentMobileNavigationDrawerState,
  );
  const settingsPathOpenedFromNavigationMenu = useAtomStateValue(
    settingsPathOpenedFromNavigationMenuState,
  );
  const isOpenedFromNavigationMenu =
    !isMobile && pathname === settingsPathOpenedFromNavigationMenu;

  return (
    (isSettingsPage && !isOpenedFromNavigationMenu) ||
    (isMobile && currentMobileNavigationDrawer === 'settings')
  );
};
