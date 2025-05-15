import { useOpenRecordsSearchPageInCommandMenu } from '@/command-menu/hooks/useOpenRecordsSearchPageInCommandMenu';
import { useWorkspaceFavorites } from '@/favorites/hooks/useWorkspaceFavorites';
import { ChatNavigationNavItem } from '@/navigation/components/ChatNavigationNavItem';
import { lastVisitedViewPerObjectMetadataItemState } from '@/navigation/states/lastVisitedViewPerObjectMetadataItemState';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerExpandedMemorizedState } from '@/ui/navigation/states/navigationDrawerExpandedMemorizedState';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  IconChartBar,
  IconLink,
  IconRobot,
  IconSearch,
  IconSettings,
} from 'twenty-ui/display';
import { useIsMobile } from 'twenty-ui/utilities';
import { getAppPath } from '~/utils/navigation/getAppPath';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const MainNavigationDrawerFixedItems = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );

  const [isNavigationDrawerExpanded, setIsNavigationDrawerExpanded] =
    useRecoilState(isNavigationDrawerExpandedState);
  const setNavigationDrawerExpandedMemorized = useSetRecoilState(
    navigationDrawerExpandedMemorizedState,
  );

  const { t } = useLingui();

  const { workspaceFavoritesObjectMetadataItems } = useWorkspaceFavorites();

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

  const { openRecordsSearchPage } = useOpenRecordsSearchPageInCommandMenu();
  return (
    !isMobile && (
      <>
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
      </>
    )
  );
};
