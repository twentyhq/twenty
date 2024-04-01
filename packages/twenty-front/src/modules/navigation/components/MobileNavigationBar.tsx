import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { IconCheckbox, IconList, IconSearch, IconSettings } from 'twenty-ui';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { AppPath } from '@/types/AppPath';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { NavigationBar } from '@/ui/navigation/navigation-bar/components/NavigationBar';
import { isNavigationDrawerOpenState } from '@/ui/navigation/states/isNavigationDrawerOpenState';

import { useIsSettingsPage } from '../hooks/useIsSettingsPage';
import { useIsTasksPage } from '../hooks/useIsTasksPage';
import { currentMobileNavigationDrawerState } from '../states/currentMobileNavigationDrawerState';

type NavigationBarItemName = 'main' | 'search' | 'tasks' | 'settings';

export const MobileNavigationBar = () => {
  const [isCommandMenuOpened] = useRecoilState(isCommandMenuOpenedState);
  const { closeCommandMenu, toggleCommandMenu } = useCommandMenu();
  const isTasksPage = useIsTasksPage();
  const isSettingsPage = useIsSettingsPage();
  const navigate = useNavigate();
  const [isNavigationDrawerOpen, setIsNavigationDrawerOpen] = useRecoilState(
    isNavigationDrawerOpenState,
  );
  const [currentMobileNavigationDrawer, setCurrentMobileNavigationDrawer] =
    useRecoilState(currentMobileNavigationDrawerState);

  const activeItemName = isNavigationDrawerOpen
    ? currentMobileNavigationDrawer
    : isCommandMenuOpened
      ? 'search'
      : isTasksPage
        ? 'tasks'
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
        setIsNavigationDrawerOpen(
          (previousIsOpen) => activeItemName !== 'main' || !previousIsOpen,
        );
        setCurrentMobileNavigationDrawer('main');
      },
    },
    {
      name: 'search',
      Icon: IconSearch,
      onClick: () => {
        setIsNavigationDrawerOpen(false);
        toggleCommandMenu();
      },
    },
    {
      name: 'tasks',
      Icon: IconCheckbox,
      onClick: () => {
        closeCommandMenu();
        setIsNavigationDrawerOpen(false);
        navigate(AppPath.TasksPage);
      },
    },
    {
      name: 'settings',
      Icon: IconSettings,
      onClick: () => {
        closeCommandMenu();
        setIsNavigationDrawerOpen(
          (previousIsOpen) => activeItemName !== 'settings' || !previousIsOpen,
        );
        setCurrentMobileNavigationDrawer('settings');
      },
    },
  ];

  return <NavigationBar activeItemName={activeItemName} items={items} />;
};
