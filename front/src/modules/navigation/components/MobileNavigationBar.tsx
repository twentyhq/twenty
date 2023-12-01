import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import {
  IconCheckbox,
  IconList,
  IconSearch,
  IconSettings,
} from '@/ui/display/icon';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { NavigationBar } from '@/ui/navigation/navigation-bar/components/NavigationBar';
import { navigationDrawerState } from '@/ui/navigation/states/navigationDrawerState';

import { useIsSettingsPage } from '../hooks/useIsSettingsPage';
import { useIsTasksPage } from '../hooks/useIsTasksPage';

type NavigationBarItemName = 'main' | 'search' | 'tasks' | 'settings';

export const MobileNavigationBar = () => {
  const [isCommandMenuOpened] = useRecoilState(isCommandMenuOpenedState);
  const { closeCommandMenu, toggleCommandMenu } = useCommandMenu();
  const isTasksPage = useIsTasksPage();
  const isSettingsPage = useIsSettingsPage();
  const navigate = useNavigate();
  const [navigationDrawer, setNavigationDrawer] = useRecoilState(
    navigationDrawerState,
  );

  const initialActiveItemName: NavigationBarItemName = isCommandMenuOpened
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
        setNavigationDrawer(navigationDrawer === 'main' ? '' : 'main');
      },
    },
    {
      name: 'search',
      Icon: IconSearch,
      onClick: () => {
        setNavigationDrawer('');
        toggleCommandMenu();
      },
    },
    {
      name: 'tasks',
      Icon: IconCheckbox,
      onClick: () => {
        closeCommandMenu();
        setNavigationDrawer('');
        navigate('/tasks');
      },
    },
    {
      name: 'settings',
      Icon: IconSettings,
      onClick: () => {
        closeCommandMenu();
        setNavigationDrawer(navigationDrawer === 'settings' ? '' : 'settings');
      },
    },
  ];

  return (
    <NavigationBar
      activeItemName={navigationDrawer || initialActiveItemName}
      items={items}
    />
  );
};
