import { useLocation } from 'react-router-dom';

import { useCurrentUserTaskCount } from '@/activities/tasks/hooks/useCurrentUserDueTaskCount';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { Favorites } from '@/favorites/components/Favorites';
import { SettingsNavbar } from '@/settings/components/SettingsNavbar';
import { IconBuildingSkyscraper } from '@/ui/display/icon/index';
import { useIsSubMenuNavbarDisplayed } from '@/ui/layout/hooks/useIsSubMenuNavbarDisplayed';
import MainNavbar from '@/ui/navigation/desktop-navbar/components/MainNavbar';
import NavItem from '@/ui/navigation/desktop-navbar/components/NavItem';
import NavTitle from '@/ui/navigation/desktop-navbar/components/NavTitle';

export const MobileNavBar = () => {
  const currentPath = useLocation().pathname;
  const { openCommandMenu } = useCommandMenu();

  const isInSubMenu = useIsSubMenuNavbarDisplayed();
  const { currentUserDueTaskCount } = useCurrentUserTaskCount();

  return (
    <>
      {!isInSubMenu ? (
        <MainNavbar>
          <Favorites />
          <NavTitle label="Workspace" />
          <NavItem
            label="Companies"
            to="/companies"
            Icon={IconBuildingSkyscraper}
            active={currentPath === '/companies'}
          />
        </MainNavbar>
      ) : (
        <SettingsNavbar />
      )}
    </>
  );
};
