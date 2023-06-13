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

const NavbarSubContainer = styled.div`
  display: flex;
  width: 160px;
  flex-direction: column;
  margin-top: 41px;
  margin-left: auto;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: 100%;
  }
`;

const NavbarContent = styled.div`
  display: ${() => (useRecoilValue(isNavbarOpenedState) ? 'block' : 'none')};
`;

interface NavbarProps {
  children: React.ReactNode;
  layout?: string;
}

export const NavbarContainer: React.FC<NavbarProps> = ({
  children,
  layout,
}) => {
  if (layout === 'secondary') {
    return (
      <StyledNavbarContainer width="500px">
        <NavbarSubContainer>
          <NavbarContent>{children}</NavbarContent>
        </NavbarSubContainer>
      </StyledNavbarContainer>
    );
  }

  return (
    <StyledNavbarContainer width="220px">
      <NavbarContent>{children}</NavbarContent>
    </StyledNavbarContainer>
  );
};
