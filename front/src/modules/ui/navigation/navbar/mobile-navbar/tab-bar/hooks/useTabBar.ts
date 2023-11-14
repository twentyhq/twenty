import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useIsMenuNavbarDisplayed } from '@/ui/layout/hooks/useIsMenuNavbarDisplayed';
import { useIsSubMenuNavbarDisplayed } from '@/ui/layout/hooks/useIsSubMenuNavbarDisplayed';
import { isNavbarOpenedState } from '@/ui/layout/states/isNavbarOpenedState';

import { IconT } from '../components/TabBarItem';

export const useTabBar = () => {
  const currentPath = useLocation().pathname;
  const navigate = useNavigate();
  const [, setIsNavbarOpened] = useRecoilState(isNavbarOpenedState);
  const { openCommandMenu } = useCommandMenu();
  const isInMenu = useIsMenuNavbarDisplayed();
  const isInSubMenu = useIsSubMenuNavbarDisplayed();

  const [activeIcon, setActiveIcon] = useState<IconT | null>(null);

  useEffect(() => {
    setIsNavbarOpened(isInMenu || isInSubMenu);

    const currentPathPrefix = currentPath
      .split('/')
      .filter(Boolean)[0] as IconT;
    setActiveIcon(
      isInMenu ? 'tab' : isInSubMenu ? 'settings' : currentPathPrefix,
    );
  }, [currentPath, isInMenu, isInSubMenu, setActiveIcon, setIsNavbarOpened]);

  const handleTabClick = (iconType: IconT) => {
    if (iconType === 'search') {
      openCommandMenu();
      setActiveIcon('search');
      return;
    }

    switch (iconType) {
      case 'tab':
        setActiveIcon('tab');
        setIsNavbarOpened(true);
        navigate('/companies');
        break;
      case 'tasks':
        navigate('/tasks');
        setActiveIcon('tasks');
        break;
      case 'settings':
        setActiveIcon('settings');
        navigate('/settings/profile');
        break;
    }
  };

  return { activeIcon, handleTabClick };
};
