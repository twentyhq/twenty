import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { WorkspaceFavorites } from '@/favorites/components/WorkspaceFavorites';
import { NavigationDrawerHeader } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerHeader';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  getImageAbsoluteURI,
  IconComponent,
  IconList,
  IconSearch,
  IconSettings,
} from 'twenty-ui';
import { useIsSettingsPage } from '../hooks/useIsSettingsPage';
import { currentMobileNavigationDrawerState } from '../states/currentMobileNavigationDrawerState';

import { CurrentWorkspaceMemberFavorites } from '@/favorites/components/CurrentWorkspaceMemberFavorites';
import { NavigationDrawerOpenedSection } from '@/object-metadata/components/NavigationDrawerOpenedSection';
import { NavigationDrawerSectionForObjectMetadataItemsWrapper } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItemsWrapper';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { navigationDrawerExpandedMemorizedState } from '@/ui/navigation/states/navigationDrawerExpandedMemorizedState';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import styled from '@emotion/styled';
import { NavigationBar } from '@/ui/navigation/navigation-bar/components/NavigationBar';
import { NavigationBarItem } from '@/ui/navigation/navigation-bar/components/NavigationBarItem';

// type NavigationBarItemName = 'main' | 'search' | 'tasks' | 'settings';

const NavigationWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 90%;
  margin: auto;
  overflow-x: auto;
  padding: ${({ theme }) => theme.spacing(3)};
  z-index: 1001;
`;

const NavigationItem = styled.div``;

export const MobileNavigationBar = () => {
  const [isCommandMenuOpened] = useRecoilState(isCommandMenuOpenedState);
  const { closeCommandMenu, openCommandMenu } = useCommandMenu();
  const isSettingsPage = useIsSettingsPage();
  const [isNavigationDrawerExpanded, setIsNavigationDrawerExpanded] =
    useRecoilState(isNavigationDrawerExpandedState);
  const [currentMobileNavigationDrawer, setCurrentMobileNavigationDrawer] =
    useRecoilState(currentMobileNavigationDrawerState);

  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const logo =
    (currentWorkspace?.logo && getImageAbsoluteURI(currentWorkspace.logo)) ??
    undefined;
  const title = currentWorkspace?.displayName ?? undefined;
  const activeItemName = isNavigationDrawerExpanded
    ? currentMobileNavigationDrawer
    : isCommandMenuOpened
      ? 'search'
      : isSettingsPage
        ? 'settings'
        : 'main';

  const isMobile = useIsMobile();
  // const { toggleCommandMenu } = useCommandMenu();
  const location = useLocation();
  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );
  const isWorkspaceFavoriteEnabled = useIsFeatureEnabled(
    'IS_WORKSPACE_FAVORITE_ENABLED',
  );

  const setNavigationDrawerExpandedMemorized = useSetRecoilState(
    navigationDrawerExpandedMemorizedState,
  );

  // const items: {
  //   name: NavigationBarItemName;
  //   Icon: IconComponent;
  //   onClick: () => void;
  // }[] = [
  //   {
  //     name: 'main',
  //     Icon: IconList,
  //     onClick: () => {
  //       closeCommandMenu();
  //       setIsNavigationDrawerExpanded(
  //         (previousIsOpen) => activeItemName !== 'main' || !previousIsOpen,
  //       );
  //       setCurrentMobileNavigationDrawer('main');
  //     },
  //   },
  //   {
  //     name: 'search',
  //     Icon: IconSearch,
  //     onClick: () => {
  //       if (!isCommandMenuOpened) {
  //         openCommandMenu();
  //       }
  //       setIsNavigationDrawerExpanded(false);
  //     },
  //   },
  //   {
  //     name: 'settings',
  //     Icon: IconSettings,
  //     onClick: () => {
  //       closeCommandMenu();
  //       setIsNavigationDrawerExpanded(
  //         (previousIsOpen) => activeItemName !== 'settings' || !previousIsOpen,
  //       );
  //       setCurrentMobileNavigationDrawer('settings');
  //     },
  //   },
  // ];

  return (
    <>
      <NavigationWrapper>
        <NavigationItem>
          <NavigationDrawerHeader
            visible={isMobile}
            name={title}
            logo={logo}
            showCollapseButton={false}
          />
        </NavigationItem>
        <NavigationItem>
          <NavigationDrawerItem
            label="Search"
            Icon={IconSearch}
            mobileNavigationDrawer={true}
            onClick={() => {
              if (!isCommandMenuOpened) {
                openCommandMenu();
              }
              setIsNavigationDrawerExpanded(false);
            }}
            // keyboard={['⌘', 'K']}
          />
        </NavigationItem>
        <NavigationItem>
          <NavigationBarItem
            key={'settings'}
            Icon={IconSettings}
            isActive={activeItemName === 'settings'}
            onClick={() => {
              closeCommandMenu();
              // setNavigationDrawerExpandedMemorized(isNavigationDrawerExpanded);
              setIsNavigationDrawerExpanded(
                (previousIsOpen) =>
                  activeItemName !== 'settings' || !previousIsOpen,
              );
              // setNavigationMemorizedUrl(location.pathname + location.search);
              setCurrentMobileNavigationDrawer('settings');
            }}
          />
        </NavigationItem>

        {/* <NavigationItem>
          <NavigationDrawerItem
            mobileNavigationDrawer={true}
            label="Settings"
            to={'/settings/profile'}
            Icon={IconSettings}
            onClick={() => {
              closeCommandMenu();
              // setNavigationDrawerExpandedMemorized(isNavigationDrawerExpanded);
              setIsNavigationDrawerExpanded(
                (previousIsOpen) =>
                  activeItemName !== 'settings' || !previousIsOpen,
              );
              // setNavigationMemorizedUrl(location.pathname + location.search);
              setCurrentMobileNavigationDrawer('settings');
            }}
          />
        </NavigationItem> */}

        {isWorkspaceFavoriteEnabled && (
          <NavigationItem>
            <NavigationDrawerOpenedSection mobileNavigationDrawer={true} />
          </NavigationItem>
        )}

        <NavigationItem>
          <CurrentWorkspaceMemberFavorites mobileNavigationDrawer={true} />
        </NavigationItem>

        {isWorkspaceFavoriteEnabled ? (
          <NavigationItem>
            <WorkspaceFavorites mobileNavigationDrawer={true} />
          </NavigationItem>
        ) : (
          <NavigationDrawerSectionForObjectMetadataItemsWrapper
            mobileNavigationDrawer={true}
            isRemote={false}
          />
        )}

        <NavigationItem>
          <NavigationDrawerSectionForObjectMetadataItemsWrapper
            mobileNavigationDrawer={true}
            isRemote={true}
          />
        </NavigationItem>
      </NavigationWrapper>

      {/* <NavigationBar activeItemName={activeItemName} items={items} /> */}
    </>
  );
};
