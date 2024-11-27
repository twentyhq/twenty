import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { useOpenSettingsMenu } from '@/navigation/hooks/useOpenSettings';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useRecoilState } from 'recoil';
import {
  IconComponent,
  IconList,
  IconSearch,
  IconSettings,
  NavigationBar,
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

  const { openSettingsMenu } = useOpenSettingsMenu();

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
        openSettingsMenu();
      },
    },
  ];

  return <NavigationBar activeItemName={activeItemName} items={items} />;
};
