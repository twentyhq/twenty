import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useOpenRecordsSearchPageInCommandMenu } from '@/command-menu/hooks/useOpenRecordsSearchPageInCommandMenu';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { useOpenSettingsMenu } from '@/navigation/hooks/useOpenSettings';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import {
  type IconComponent,
  IconList,
  IconSearch,
  IconSettings,
} from 'twenty-ui/display';
import { NavigationBar } from 'twenty-ui/navigation';
import { useIsSettingsPage } from '../hooks/useIsSettingsPage';
import { currentMobileNavigationDrawerState } from '../states/currentMobileNavigationDrawerState';

type NavigationBarItemName = 'main' | 'search' | 'tasks' | 'settings';

export const MobileNavigationBar = () => {
  const navigate = useNavigate();
  const { defaultHomePagePath } = useDefaultHomePagePath();
  const [isCommandMenuOpened] = useRecoilState(isCommandMenuOpenedState);
  const { closeCommandMenu } = useCommandMenu();
  const { openRecordsSearchPage } = useOpenRecordsSearchPageInCommandMenu();
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

        if (isSettingsPage) {
          navigate(defaultHomePagePath);
        }
      },
    },
    {
      name: 'search',
      Icon: IconSearch,
      onClick: openRecordsSearchPage,
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
