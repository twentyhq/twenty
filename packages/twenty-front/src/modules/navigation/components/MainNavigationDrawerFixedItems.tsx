import { isChatbotEnabledState } from '@/client-config/states/isChatbotEnabledState';
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
  const lastVisitedViewPerObjectMetadataItem =
    useRecoilValue(lastVisitedViewPerObjectMetadataItemState) ?? {};

  const isChatbotEnabled = useRecoilValue(isChatbotEnabledState);

  const getNavigationPath = (objectName: string) => {
    const objectMetadata = workspaceFavoritesObjectMetadataItems?.find(
      (item: any) => item.nameSingular === objectName,
    );

    const viewId = objectMetadata?.id;
    const lastVisitedViewId = lastVisitedViewPerObjectMetadataItem?.[viewId];

    return getAppPath(
      AppPath.RecordIndexPage,
      { objectNamePlural: objectMetadata?.namePlural ?? '' },
      lastVisitedViewId ? { viewId: lastVisitedViewId } : undefined,
    );
  };

  const traceablePath = getNavigationPath('traceable');
  const chatbotPath = getNavigationPath('chatbot');

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
        {isChatbotEnabled && (
          <NavigationDrawerItem
            label="Chatbot"
            to={chatbotPath}
            onClick={() => {
              setNavigationMemorizedUrl(location.pathname + location.search);
            }}
            Icon={IconRobot}
          />
        )}
        <NavigationDrawerItem
          label="Dashboard links"
          to={'/dashboard-links'}
          Icon={IconChartBar}
        />
        <NavigationDrawerItem
          label="Traceable link"
          to={traceablePath}
          onClick={() => {
            setNavigationMemorizedUrl(location.pathname + location.search);
          }}
          Icon={IconLink}
        />
      </>
    )
  );
};
