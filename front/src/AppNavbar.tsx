import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@emotion/react';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { Favorites } from '@/favorites/components/Favorites';
import { SettingsNavbar } from '@/settings/components/SettingsNavbar';
import {
  IconBell,
  IconBuildingSkyscraper,
  IconCheckbox,
  IconSearch,
  IconSettings,
  IconTargetArrow,
  IconUser,
} from '@/ui/icon/index';
import { useIsSubMenuNavbarDisplayed } from '@/ui/layout/hooks/useIsSubMenuNavbarDisplayed';
import MainNavbar from '@/ui/navbar/components/MainNavbar';
import NavItem from '@/ui/navbar/components/NavItem';
import NavTitle from '@/ui/navbar/components/NavTitle';

import { measureTotalFrameLoad } from './utils/measureTotalFrameLoad';

export function AppNavbar() {
  const theme = useTheme();
  const currentPath = useLocation().pathname;
  const { openCommandMenu } = useCommandMenu();

  const navigate = useNavigate();

  const isInSubMenu = useIsSubMenuNavbarDisplayed();

  return (
    <>
      {!isInSubMenu ? (
        <MainNavbar>
          <NavItem
            label="Search"
            Icon={IconSearch}
            iconProps={{ size: theme.icon.size.md }}
            onClick={() => {
              openCommandMenu();
            }}
          />
          <NavItem
            label="Notifications"
            to="/inbox"
            Icon={IconBell}
            iconProps={{ size: theme.icon.size.md }}
            soon={true}
          />
          <NavItem
            label="Settings"
            to="/settings/profile"
            Icon={IconSettings}
            iconProps={{ size: theme.icon.size.md }}
          />
          <NavItem
            label="Tasks"
            to="/tasks"
            active={currentPath === '/tasks'}
            Icon={IconCheckbox}
            iconProps={{ size: theme.icon.size.md }}
          />
          <Favorites />
          <NavTitle label="Workspace" />
          <NavItem
            label="Companies"
            to="/companies"
            Icon={IconBuildingSkyscraper}
            iconProps={{ size: theme.icon.size.md }}
            active={currentPath === '/companies'}
          />
          <NavItem
            label="People"
            to="/people"
            onClick={() => {
              measureTotalFrameLoad('people');

              navigate('/people');
            }}
            Icon={IconUser}
            iconProps={{ size: theme.icon.size.md }}
            active={currentPath === '/people'}
          />
          <NavItem
            label="Opportunities"
            // to="/opportunities"
            onClick={() => {
              measureTotalFrameLoad('opportunities');

              navigate('/opportunities');
            }}
            Icon={IconTargetArrow}
            iconProps={{ size: theme.icon.size.md }}
            active={currentPath === '/opportunities'}
          />
        </MainNavbar>
      ) : (
        <SettingsNavbar />
      )}
    </>
  );
}
