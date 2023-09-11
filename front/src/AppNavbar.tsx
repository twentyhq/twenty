import { useLocation, useNavigate } from 'react-router-dom';

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
import TaskNavMenuItem from '@/ui/navbar/components/TaskNavMenuItem';

import { measureTotalFrameLoad } from './utils/measureTotalFrameLoad';

export function AppNavbar() {
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
            onClick={() => {
              openCommandMenu();
            }}
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
          <TaskNavMenuItem
            label="Tasks"
            to="/tasks"
            active={currentPath === '/tasks'}
            Icon={IconCheckbox}
          />
          <Favorites />
          <NavTitle label="Workspace" />
          <NavItem
            label="Companies"
            to="/companies"
            Icon={IconBuildingSkyscraper}
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
            active={currentPath === '/opportunities'}
          />
        </MainNavbar>
      ) : (
        <SettingsNavbar />
      )}
    </>
  );
}
