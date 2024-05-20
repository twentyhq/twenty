import { useLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { IconCheckbox, IconSearch, IconSettings } from 'twenty-ui';

import { CurrentUserDueTaskCountEffect } from '@/activities/tasks/components/CurrentUserDueTaskCountEffect';
import { currentUserDueTaskCountState } from '@/activities/tasks/states/currentUserTaskCountState';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { Favorites } from '@/favorites/components/Favorites';
import { MainNavigationDrawerItemsSkeletonLoader } from '@/navigation/components/MainNavigationDrawerItemsSkeletonLoader';
import { ObjectMetadataNavItems } from '@/object-metadata/components/ObjectMetadataNavItems';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useUserOrMetadataLoading } from '~/hooks/useUserOrMetadataLoading';

import { useIsTasksPage } from '../hooks/useIsTasksPage';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

export const MainNavigationDrawerItems = () => {
  const isMobile = useIsMobile();
  const { toggleCommandMenu } = useCommandMenu();
  const isTasksPage = useIsTasksPage();
  const currentUserDueTaskCount = useRecoilValue(currentUserDueTaskCountState);
  const location = useLocation();
  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );

  const loading = useUserOrMetadataLoading();

  if (loading) {
    return (
      <StyledContainer>
        <MainNavigationDrawerItemsSkeletonLoader length={4} />
        <MainNavigationDrawerItemsSkeletonLoader title length={2} />
        <MainNavigationDrawerItemsSkeletonLoader title length={3} />
      </StyledContainer>
    );
  }

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
            label="Settings"
            to={'/settings/profile'}
            onClick={() => {
              setNavigationMemorizedUrl(location.pathname + location.search);
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
