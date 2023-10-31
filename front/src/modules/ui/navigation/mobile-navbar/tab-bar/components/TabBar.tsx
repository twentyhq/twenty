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
  z-index: 9999999;
`;
const StyledIconContainer = styled.div`
  align-items: center;
  aspect-ratio: 1/1;
  display: flex;
  justify-content: center;
  width: ${({ theme }) => theme.icon.size.xl}px;
`;

const TabBar = () => {
  const [, setIsNavbarOpened] = useRecoilState(isNavbarOpenedState);
  const { openCommandMenu } = useCommandMenu();
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useIsMobile();
  return (
    <StyledContainer isMobile={isMobile}>
      <StyledIconContainer>
        <IconList
          color={theme.color.gray50}
          onClick={() => setIsNavbarOpened((prev) => !prev)}
        />
      </StyledIconContainer>
      <StyledIconContainer
        onClick={() => {
          openCommandMenu();
        }}
      >
        <IconSearch color={theme.color.gray50} />
      </StyledIconContainer>
      <StyledIconContainer
        onClick={() => {
          navigate('/tasks');
        }}
      >
        <IconCheckbox color={theme.color.gray50} />
      </StyledIconContainer>
      <StyledIconContainer
        onClick={() => {
          navigate('/settings/profile');
        }}
      >
        <IconSettings color={theme.color.gray50} />
      </StyledIconContainer>
    </StyledContainer>
  );
};

export default TabBar;
