import { Favorites } from '@/favorites/components/Favorites';
import { SettingsNavbar } from '@/settings/components/SettingsNavbar';
import { WorkspaceNavItems } from './WorkspaceNavItems';
import MainNavbar from '@/ui/navigation/navigation-drawer/components/MainNavbar';
import { useRecoilState } from 'recoil';
import { navigationDrawerState } from '@/ui/layout/states/isNavbarOpenedState';

export const MobileNavigationDrawer = () => {
  const [navigationDrawer] = useRecoilState(navigationDrawerState)

  return navigationDrawer === "settings" ? (
    <SettingsNavbar />
  ) : (
    <MainNavbar>
      <Favorites />
      <WorkspaceNavItems />
    </MainNavbar>
  );
};
