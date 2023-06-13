import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { isNavbarOpenedState } from '../states/isNavbarOpenedState';
import { MOBILE_VIEWPORT } from '../styles/themes';

const StyledNavbarContainer = styled.div<{ width: string }>`
  flex-direction: column;
  width: ${(props) =>
    useRecoilValue(isNavbarOpenedState) ? props.width : '0'};
  padding: ${(props) => props.theme.spacing(2)};
  flex-shrink: 0;
  overflow: hidden;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: ${(props) =>
      useRecoilValue(isNavbarOpenedState)
        ? `calc(100% - ` + props.theme.spacing(4) + `)`
        : '0'};
`;

const NavbarContent = styled.div`
  display: ${() => (useRecoilValue(isNavbarOpenedState) ? 'block' : 'none')};
`;

interface NavbarProps {
  children: React.ReactNode;
  width: string;
}

export const NavbarContainer: React.FC<NavbarProps> = ({ children, width }) => (
  <StyledNavbarContainer width={width}>
    <NavbarContent>{children}</NavbarContent>
  </StyledNavbarContainer>
);
