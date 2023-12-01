import { useLocation, useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

import { useCurrentUserTaskCount } from '@/activities/tasks/hooks/useCurrentUserDueTaskCount';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { Favorites } from '@/favorites/components/Favorites';
import { useIsTasksPage } from '@/navigation/hooks/useIsTasksPage';
import { SettingsNavbar } from '@/settings/components/SettingsNavbar';
import {
  IconBell,
  IconCheckbox,
  IconSearch,
  IconSettings,
} from '@/ui/display/icon/index';
import MainNavbar from '@/ui/navigation/navigation-drawer/components/MainNavbar';
import NavItem from '@/ui/navigation/navigation-drawer/components/NavItem';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';

import { useIsSettingsPage } from '../hooks/useIsSettingsPage';

import { WorkspaceNavItems } from './WorkspaceNavItems';

export const DesktopNavigationDrawer = () => {
  const { toggleCommandMenu } = useCommandMenu();
  const isSettingsPage = useIsSettingsPage();
  const isTasksPage = useIsTasksPage();
  const { currentUserDueTaskCount } = useCurrentUserTaskCount();
  const navigate = useNavigate();
  const location = useLocation();
  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );

  return isSettingsPage ? (
    <SettingsNavbar />
  ) : (
    <MainNavbar>
      <NavItem
        label="Search"
        Icon={IconSearch}
        onClick={toggleCommandMenu}
        keyboard={['⌘', 'K']}
      />
      <NavItem label="Notifications" to="/inbox" Icon={IconBell} soon />
      <NavItem
        label="Settings"
        onClick={() => {
          setNavigationMemorizedUrl(location.pathname + location.search);
          navigate('/settings/profile');
        }}
        Icon={IconSettings}
      />
      <NavItem
        label="Tasks"
        to="/tasks"
        active={isTasksPage}
        Icon={IconCheckbox}
        count={currentUserDueTaskCount}
      />
      <Favorites />
      <WorkspaceNavItems />
    </MainNavbar>
  );
};
