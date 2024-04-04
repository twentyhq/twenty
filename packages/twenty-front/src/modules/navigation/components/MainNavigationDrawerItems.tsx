import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { IconCheckbox, IconInbox, IconSearch, IconSettings } from 'twenty-ui';

import { CurrentUserDueTaskCountEffect } from '@/activities/tasks/components/CurrentUserDueTaskCountEffect';
import { currentUserDueTaskCountState } from '@/activities/tasks/states/currentUserTaskCountState';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { Favorites } from '@/favorites/components/Favorites';
import { ObjectMetadataNavItems } from '@/object-metadata/components/ObjectMetadataNavItems';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { useIsTasksPage } from '../hooks/useIsTasksPage';

export const MainNavigationDrawerItems = () => {
  const isMobile = useIsMobile();
  const { toggleCommandMenu } = useCommandMenu();
  const isTasksPage = useIsTasksPage();
  const currentUserDueTaskCount = useRecoilValue(currentUserDueTaskCountState);
  const navigate = useNavigate();
  const location = useLocation();
  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );

  return (
    <>
      {!isMobile && (
        <NavigationDrawerSection>
          <NavigationDrawerItem
            label="Search"
            Icon={IconSearch}
            onClick={toggleCommandMenu}
            keyboard={['⌘', 'K']}
          />
          <NavigationDrawerItem
            label="Inbox"
            to="/inbox"
            Icon={IconInbox}
            soon
          />
          <NavigationDrawerItem
            label="Settings"
            onClick={() => {
              setNavigationMemorizedUrl(location.pathname + location.search);
              navigate('/settings/profile');
            }}
            Icon={IconSettings}
          />
          <CurrentUserDueTaskCountEffect />
          <NavigationDrawerItem
            label="Tasks"
            to="/tasks"
            active={isTasksPage}
            Icon={IconCheckbox}
            count={currentUserDueTaskCount}
          />
        </NavigationDrawerSection>
      )}

      <Favorites />

      <NavigationDrawerSection>
        <NavigationDrawerSectionTitle label="Workspace" />
        <ObjectMetadataNavItems />
      </NavigationDrawerSection>
    </>
  );
};
