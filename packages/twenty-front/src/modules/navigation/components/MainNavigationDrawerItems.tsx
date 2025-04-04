/* eslint-disable no-restricted-imports */
import { useLocation } from 'react-router-dom';

import { IconChartBar } from '@tabler/icons-react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { useOpenRecordsSearchPageInCommandMenu } from '@/command-menu/hooks/useOpenRecordsSearchPageInCommandMenu';
import { CurrentWorkspaceMemberFavoritesFolders } from '@/favorites/components/CurrentWorkspaceMemberFavoritesFolders';
import { WorkspaceFavorites } from '@/favorites/components/WorkspaceFavorites';
import { useWorkspaceFavorites } from '@/favorites/hooks/useWorkspaceFavorites';
import { ChatNavigationNavItem } from '@/navigation/components/ChatNavigationNavItem';
import { lastVisitedViewPerObjectMetadataItemState } from '@/navigation/states/lastVisitedViewPerObjectMetadataItemState';
import { NavigationDrawerOpenedSection } from '@/object-metadata/components/NavigationDrawerOpenedSection';
import { RemoteNavigationDrawerSection } from '@/object-metadata/components/RemoteNavigationDrawerSection';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerExpandedMemorizedState } from '@/ui/navigation/states/navigationDrawerExpandedMemorizedState';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import {
  IconLink,
  IconRobot,
  IconSearch,
  IconSettings,
} from 'twenty-ui/display';
import { getAppPath } from '~/utils/navigation/getAppPath';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledMainSection = styled(NavigationDrawerSection)`
  min-height: fit-content;
`;
const StyledInnerContainer = styled.div`
  height: 100%;
  width: 100%;
`;

export const MainNavigationDrawerItems = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );
  const { workspaceFavoritesObjectMetadataItems } = useWorkspaceFavorites();

  const [isNavigationDrawerExpanded, setIsNavigationDrawerExpanded] =
    useRecoilState(isNavigationDrawerExpandedState);
  const setNavigationDrawerExpandedMemorized = useSetRecoilState(
    navigationDrawerExpandedMemorizedState,
  );

  const { t } = useLingui();

  const { openRecordsSearchPage } = useOpenRecordsSearchPageInCommandMenu();

  const traceableObject = useMemo(() => {
    return workspaceFavoritesObjectMetadataItems?.find(
      (item) => item.nameSingular === 'traceable',
    );
  }, [workspaceFavoritesObjectMetadataItems]);

  const viewId = traceableObject?.id;

  const lastVisitedViewPerObjectMetadataItem = useRecoilValue(
    lastVisitedViewPerObjectMetadataItemState,
  );

  const lastVisitedViewId = lastVisitedViewPerObjectMetadataItem?.[viewId];

  const navigationPath = getAppPath(
    AppPath.RecordIndexPage,
    { objectNamePlural: traceableObject?.namePlural ?? '' },
    lastVisitedViewId ? { viewId: lastVisitedViewId } : undefined,
  );

  return (
    <>
      {!isMobile && (
        <StyledMainSection>
          <NavigationDrawerItem
            label={t`Search`}
            Icon={IconSearch}
            onClick={openRecordsSearchPage}
            keyboard={['/']}
          />
          <NavigationDrawerItem
            label={t`Settings`}
            to={getSettingsPath(SettingsPath.ProfilePage)}
            onClick={() => {
              setNavigationDrawerExpandedMemorized(isNavigationDrawerExpanded);
              setIsNavigationDrawerExpanded(true);
              setNavigationMemorizedUrl(location.pathname + location.search);
            }}
            Icon={IconSettings}
          />
          <ChatNavigationNavItem />
          <NavigationDrawerItem
            label="Bot"
            to={'/chatbot'}
            onClick={() => {
              setNavigationMemorizedUrl(location.pathname + location.search);
            }}
            Icon={IconRobot}
          />
          <NavigationDrawerItem
            label="Dashboard links"
            to={'/dashboard-links'}
            Icon={IconChartBar}
          />
          <NavigationDrawerItem
            label="Traceable link"
            to={navigationPath}
            onClick={() => {
              setNavigationMemorizedUrl(location.pathname + location.search);
            }}
            Icon={IconLink}
          />
        </StyledMainSection>
      )}
      <ScrollWrapper
        componentInstanceId={`scroll-wrapper-navigation-drawer`}
        defaultEnableXScroll={false}
      >
        <StyledInnerContainer>
          <NavigationDrawerOpenedSection />
          <CurrentWorkspaceMemberFavoritesFolders />
          <WorkspaceFavorites />
          <RemoteNavigationDrawerSection />
        </StyledInnerContainer>
      </ScrollWrapper>
    </>
  );
};
