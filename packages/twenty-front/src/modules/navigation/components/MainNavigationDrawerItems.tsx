import { useLocation } from 'react-router-dom';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { IconSearch, IconSettings } from 'twenty-ui';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { CurrentWorkspaceMemberFavorites } from '@/favorites/components/CurrentWorkspaceMemberFavorites';
import { WorkspaceFavorites } from '@/favorites/components/WorkspaceFavorites';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { currentMobileNavigationDrawerState } from '@/navigation/states/currentMobileNavigationDrawerState';
import { NavigationDrawerOpenedSection } from '@/object-metadata/components/NavigationDrawerOpenedSection';
import { NavigationDrawerSectionForObjectMetadataItemsWrapper } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItemsWrapper';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerExpandedMemorizedState } from '@/ui/navigation/states/navigationDrawerExpandedMemorizedState';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useEffect } from 'react';

export const MainNavigationDrawerItems = () => {
  const isMobile = useIsMobile();
  const { toggleCommandMenu } = useCommandMenu();
  const location = useLocation();
  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );
  const isWorkspaceFavoriteEnabled = useIsFeatureEnabled(
    'IS_WORKSPACE_FAVORITE_ENABLED',
  );
  const [isNavigationDrawerExpanded, setIsNavigationDrawerExpanded] =
    useRecoilState(isNavigationDrawerExpandedState);
  const setNavigationDrawerExpandedMemorized = useSetRecoilState(
    navigationDrawerExpandedMemorizedState,
  );
  const [isCommandMenuOpened] = useRecoilState(isCommandMenuOpenedState);
  const isSettingsPage = useIsSettingsPage();
  const { closeCommandMenu } = useCommandMenu();
  const [currentMobileNavigationDrawer, setCurrentMobileNavigationDrawer] =
    useRecoilState(currentMobileNavigationDrawerState);
  const activeItemName = isNavigationDrawerExpanded
    ? currentMobileNavigationDrawer
    : isCommandMenuOpened
      ? 'search'
      : isSettingsPage
        ? 'settings'
        : 'main';

  useEffect(() => {
    if (isMobile) {
      setIsNavigationDrawerExpanded(false);
    }
  }, [isMobile, setIsNavigationDrawerExpanded]);

  return (
    <>
      <NavigationDrawerSection isMobile={isMobile}>
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
            if (isMobile) {
              closeCommandMenu();
              setIsNavigationDrawerExpanded(
                (previousIsOpen) =>
                  activeItemName !== 'settings' || !previousIsOpen,
              );
              setCurrentMobileNavigationDrawer('settings');
            } else {
              setNavigationDrawerExpandedMemorized(isNavigationDrawerExpanded);
              setIsNavigationDrawerExpanded(true);
              setNavigationMemorizedUrl(location.pathname + location.search);
            }
          }}
          Icon={IconSettings}
        />
      </NavigationDrawerSection>

      {isWorkspaceFavoriteEnabled && <NavigationDrawerOpenedSection />}

      <CurrentWorkspaceMemberFavorites />

      {isWorkspaceFavoriteEnabled ? (
        <WorkspaceFavorites />
      ) : (
        <NavigationDrawerSectionForObjectMetadataItemsWrapper
          isRemote={false}
        />
      )}
      <NavigationDrawerSectionForObjectMetadataItemsWrapper isRemote={true} />
    </>
  );
};
