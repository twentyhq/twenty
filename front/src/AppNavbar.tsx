import { useLocation } from 'react-router-dom';

import { useCurrentUserTaskCount } from '@/activities/tasks/hooks/useCurrentUserDueTaskCount';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { Favorites } from '@/favorites/components/Favorites';
import { ObjectMetadataNavItems } from '@/object-metadata/components/ObjectMetadataNavItems';
import { SettingsNavbar } from '@/settings/components/SettingsNavbar';
import {
  IconBell,
  IconCheckbox,
  IconSearch,
  IconSettings,
} from '@/ui/display/icon/index';
import { useIsSubMenuNavbarDisplayed } from '@/ui/layout/hooks/useIsSubMenuNavbarDisplayed';
import MainNavbar from '@/ui/navigation/navbar/components/MainNavbar';
import NavItem from '@/ui/navigation/navbar/components/NavItem';
import NavTitle from '@/ui/navigation/navbar/components/NavTitle';

export const AppNavbar = () => {
  const currentPath = useLocation().pathname;
  const { openCommandMenu } = useCommandMenu();

  const isInSubMenu = useIsSubMenuNavbarDisplayed();
  const { currentUserDueTaskCount } = useCurrentUserTaskCount();

  return (
    <>
      {!isInSubMenu ? (
        <MainNavbar>
          <NavItem
            label="Search"
            Icon={IconSearch}
            onClick={() => {
              openCommandMenu();
            }}
            keyboard={['⌘', 'K']}
          />
          <NavItem
            label="Notifications"
            to="/inbox"
            Icon={IconBell}
            soon={true}
          />
          <NavItem
            label="Settings"
            to="/settings/profile"
            Icon={IconSettings}
          />
          <NavItem
            label="Tasks"
            to="/tasks"
            active={currentPath === '/tasks'}
            Icon={IconCheckbox}
            count={currentUserDueTaskCount}
          />
          <Favorites />
          <NavTitle label="Workspace" />
          <ObjectMetadataNavItems />
        </MainNavbar>
      ) : (
        <SettingsNavbar />
      )}
    </>
  );
};
