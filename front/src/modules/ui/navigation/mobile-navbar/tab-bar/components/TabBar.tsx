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
  const [, setIsNavbarOpened] = useRecoilState(isNavbarOpenedState);
  const { openCommandMenu } = useCommandMenu();
  const [activeIcon, setActiveIcon] = useState<IconT | null>(null);
  const [isSettingsSubmenuOpen, setIsSettingsSubmenuOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (currentPath === '/companies' || !currentPath.startsWith('/settings')) {
      setIsSettingsSubmenuOpen(false);
      setActiveIcon(null);
      setIsNavbarOpened(false);
    }
  }, [currentPath, setIsNavbarOpened]);

  const handleTabBarClick = () => {
    if (currentPath !== '/companies' && !currentPath.startsWith('/settings')) {
      navigate('/companies');
      setActiveIcon(() => 'tab');
      return;
    }
    setIsSettingsSubmenuOpen(() => currentPath.startsWith('/settings'));
    setActiveIcon((prev) => (prev === 'tab' ? null : 'tab'));
    setIsNavbarOpened((prev) => !prev);
  };

  return (
    <StyledContainer isMobile={isMobile}>
      <StyledIconContainer
        isActive={activeIcon === 'tab'}
        onClick={() => handleTabBarClick()}
      >
        <IconList color={theme.color.gray50} />
      </StyledIconContainer>
      <StyledIconContainer
        isActive={activeIcon === 'search'}
        onClick={() => {
          openCommandMenu();
          setActiveIcon('search');
          setIsSettingsSubmenuOpen(false);
        }}
      >
        <IconSearch color={theme.color.gray50} />
      </StyledIconContainer>
      <StyledIconContainer
        isActive={activeIcon === 'tasks'}
        onClick={() => {
          setActiveIcon(() => 'tasks');
          navigate('/tasks');
        }}
      >
        <IconCheckbox color={theme.color.gray50} />
      </StyledIconContainer>
      <StyledIconContainer
        isActive={activeIcon === 'settings' || isSettingsSubmenuOpen}
        onClick={() => {
          setActiveIcon(() => 'settings');
          navigate('/settings/profile');
        }}
      >
        <IconSettings color={theme.color.gray50} />
      </StyledIconContainer>
    </StyledContainer>
  );
};

export default TabBar;
