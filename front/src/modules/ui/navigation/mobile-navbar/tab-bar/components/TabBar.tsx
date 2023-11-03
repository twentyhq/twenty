import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import {
  IconCheckbox,
  IconList,
  IconSearch,
  IconSettings,
} from '@/ui/display/icon';
import { useIsMenuNavbarDisplayed } from '@/ui/layout/hooks/useIsMenuNavbarDisplayed';
import { useIsSubMenuNavbarDisplayed } from '@/ui/layout/hooks/useIsSubMenuNavbarDisplayed';
import { isNavbarOpenedState } from '@/ui/layout/states/isNavbarOpenedState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

const StyledContainer = styled.div<{
  isMobile: boolean;
}>`
  bottom: ${({ theme }) => theme.spacing(4)};
  display: ${({ isMobile }) => (isMobile ? 'flex' : 'none')};
  gap: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  position: fixed;
  width: 100%;
`;
const StyledIconContainer = styled.div<{ isActive?: boolean }>`
  align-items: center;
  aspect-ratio: 1/1;
  background-color: ${({ isActive, theme }) =>
    isActive ? theme.background.tertiary : theme.background.transparent};
  border-radius: ${({ theme }) => theme.spacing(1)};
  display: flex;
  justify-content: center;
  width: ${({ theme }) => theme.icon.size.xl}px;
`;

type IconT = 'tab' | 'search' | 'tasks' | 'settings';

const TabBar = () => {
  const currentPath = useLocation().pathname;
  const navigate = useNavigate();
  const [isNavbarOpened, setIsNavbarOpened] =
    useRecoilState(isNavbarOpenedState);
  const { openCommandMenu } = useCommandMenu();
  const [activeIcon, setActiveIcon] = useState<IconT | null>(null);
  const isInMenu = useIsMenuNavbarDisplayed();
  const isInSubMenu = useIsSubMenuNavbarDisplayed();
  const theme = useTheme();
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsNavbarOpened(isInMenu || isInSubMenu);

    const currentPathPrefix = currentPath
      .split('/')
      .filter(Boolean)[0] as IconT;
    setActiveIcon(
      isInMenu ? 'tab' : isInSubMenu ? 'settings' : currentPathPrefix,
    );
  }, [currentPath]);

  const handleTabBarClick = (iconType: IconT) => {
    if (iconType === 'search') {
      openCommandMenu();
      setActiveIcon('search');
      return;
    }

    // Handle other icon clicks
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

  return (
    <StyledContainer isMobile={isMobile}>
      <StyledIconContainer
        isActive={activeIcon === 'tab'}
        onClick={() => handleTabBarClick('tab')}
      >
        <IconList color={theme.color.gray50} />
      </StyledIconContainer>
      <StyledIconContainer
        isActive={activeIcon === 'search'}
        onClick={() => handleTabBarClick('search')}
      >
        <IconSearch color={theme.color.gray50} />
      </StyledIconContainer>
      <StyledIconContainer
        isActive={activeIcon === 'tasks'}
        onClick={() => handleTabBarClick('tasks')}
      >
        <IconCheckbox color={theme.color.gray50} />
      </StyledIconContainer>
      <StyledIconContainer
        isActive={activeIcon === 'settings'}
        onClick={() => handleTabBarClick('settings')}
      >
        <IconSettings color={theme.color.gray50} />
      </StyledIconContainer>
    </StyledContainer>
  );
};

export default TabBar;
