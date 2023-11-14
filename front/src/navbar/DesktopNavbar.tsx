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
  IconTargetArrow,
} from '@/ui/display/icon/index';
import { useIsSubMenuNavbarDisplayed } from '@/ui/layout/hooks/useIsSubMenuNavbarDisplayed';
import WorkspaceItems from '@/ui/navigation/navbar/components/WorkspaceItems';
import MainNavbar from '@/ui/navigation/navbar/desktop-navbar/components/MainNavbar';
import NavItem from '@/ui/navigation/navbar/desktop-navbar/components/NavItem';

export const DesktopNavbar = () => {
  const currentPath = useLocation().pathname;
  const { toggleCommandMenu } = useCommandMenu();

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
              toggleCommandMenu();
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
          <WorkspaceItems currentPath={currentPath} />
          <ObjectMetadataNavItems />
          <NavItem
            label="Opportunities"
            to="/objects/opportunities"
            active={currentPath === '/objects/opportunities'}
            Icon={IconTargetArrow}
          />
        </MainNavbar>
      ) : (
        <SettingsNavbar />
      )}
    </>
  );
};
