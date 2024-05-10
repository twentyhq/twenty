import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
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

const StyledSkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-left: 12px;
`;

const StyledSkeletonLoader = ({
  title,
  length,
}: {
  title?: boolean;
  length: number;
}) => {
  const theme = useTheme();
  return (
    <StyledSkeletonContainer>
      <SkeletonTheme
        baseColor={theme.background.tertiary}
        highlightColor={theme.background.transparent.lighter}
        borderRadius={4}
      >
        {title && <Skeleton width={48} height={13} />}
        {Array.from({ length }).map((_, index) => (
          <Skeleton key={index} width={196} height={16} />
        ))}
      </SkeletonTheme>
    </StyledSkeletonContainer>
  );
};

export const MainNavigationDrawerItems = ({
  loading = false,
}: {
  loading?: boolean;
}) => {
  const isMobile = useIsMobile();
  const { toggleCommandMenu } = useCommandMenu();
  const isTasksPage = useIsTasksPage();
  const currentUserDueTaskCount = useRecoilValue(currentUserDueTaskCountState);
  const navigate = useNavigate();
  const location = useLocation();
  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );

  if (loading) {
    return (
      <>
        <StyledSkeletonLoader length={4} />
        <StyledSkeletonLoader title length={2} />
        <StyledSkeletonLoader title length={3} />
      </>
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
