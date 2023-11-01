import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [, setIsNavbarOpened] = useRecoilState(isNavbarOpenedState);
  const { openCommandMenu } = useCommandMenu();
  const navigate = useNavigate();
  const [activeIcon, setActiveIcon] = useState<IconT | null>(null);

  const theme = useTheme();
  const isMobile = useIsMobile();

  return (
    <StyledContainer isMobile={isMobile}>
      <StyledIconContainer
        isActive={activeIcon === 'tab'}
        onClick={() => {
          setActiveIcon((prev) => {
            return prev === 'tab' ? null : 'tab';
          });
          setIsNavbarOpened((prev) => !prev);
        }}
      >
        <IconList color={theme.color.gray50} />
      </StyledIconContainer>
      <StyledIconContainer
        isActive={activeIcon === 'search'}
        onClick={() => {
          openCommandMenu();
          setActiveIcon((prev) => (prev === 'search' ? null : 'search'));
        }}
      >
        <IconSearch color={theme.color.gray50} />
      </StyledIconContainer>
      <StyledIconContainer
        isActive={activeIcon === 'tasks'}
        onClick={() => {
          setActiveIcon((prev) => (prev === 'tasks' ? null : 'tasks'));
          navigate('/tasks');
        }}
      >
        <IconCheckbox color={theme.color.gray50} />
      </StyledIconContainer>
      <StyledIconContainer
        isActive={activeIcon === 'settings'}
        onClick={() => {
          setActiveIcon((prev) => (prev === 'settings' ? null : 'settings'));
          navigate('/settings/profile');
        }}
      >
        <IconSettings color={theme.color.gray50} />
      </StyledIconContainer>
    </StyledContainer>
  );
};

export default TabBar;
