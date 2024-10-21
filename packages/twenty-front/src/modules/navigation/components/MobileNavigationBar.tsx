import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { WorkspaceFavorites } from '@/favorites/components/WorkspaceFavorites';
import { NavigationBar } from '@/ui/navigation/navigation-bar/components/NavigationBar';
import { NavigationDrawerHeader } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerHeader';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  getImageAbsoluteURI,
  IconComponent,
  IconList,
  IconSearch,
  IconSettings,
} from 'twenty-ui';
import { useIsSettingsPage } from '../hooks/useIsSettingsPage';
import { currentMobileNavigationDrawerState } from '../states/currentMobileNavigationDrawerState';

type NavigationBarItemName = 'main' | 'search' | 'tasks' | 'settings';

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

  const items: {
    name: NavigationBarItemName;
    Icon: IconComponent;
    onClick: () => void;
  }[] = [
    {
      name: 'main',
      Icon: IconList,
      onClick: () => {
        closeCommandMenu();
        setIsNavigationDrawerExpanded(
          (previousIsOpen) => activeItemName !== 'main' || !previousIsOpen,
        );
        setCurrentMobileNavigationDrawer('main');
      },
    },
    {
      name: 'search',
      Icon: IconSearch,
      onClick: () => {
        if (!isCommandMenuOpened) {
          openCommandMenu();
        }
        setIsNavigationDrawerExpanded(false);
      },
    },
    {
      name: 'settings',
      Icon: IconSettings,
      onClick: () => {
        closeCommandMenu();
        setIsNavigationDrawerExpanded(
          (previousIsOpen) => activeItemName !== 'settings' || !previousIsOpen,
        );
        setCurrentMobileNavigationDrawer('settings');
      },
    },
  ];

  return (
    <>
      <NavigationDrawerHeader
        name={title}
        logo={logo}
        showCollapseButton={false}
      />
      <WorkspaceFavorites />
      <NavigationBar activeItemName={activeItemName} items={items} />
    </>
  );
};
