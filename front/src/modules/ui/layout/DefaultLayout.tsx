import styled from '@emotion/styled';
import { useRecoilState, useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { CommandMenu } from '@/search/components/CommandMenu';

import { NavbarContainer } from './navbar/NavbarContainer';
import { isNavbarOpenedState } from './states/isNavbarOpenedState';
import { MOBILE_VIEWPORT } from './styles/themes';

const StyledLayout = styled.div`
  background: ${(props) => props.theme.noisyBackground};
  display: flex;
  flex-direction: row;
  height: 100vh;
  position: relative;
  width: 100vw;
`;

const DEFAULT_NAVBAR_WIDTH = 236;

const MainContainer = styled.div<{ navbarWidth: number }>`
  display: flex;
  flex-direction: row;
  overflow: hidden;
  width: ${(props) =>
    useRecoilValue(isNavbarOpenedState)
      ? `(calc(100% - ${props.navbarWidth}px)`
      : '100%'};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: ${() => (useRecoilValue(isNavbarOpenedState) ? '0' : '100%')};
  }
`;

type OwnProps = {
  children: JSX.Element;
  Navbar: () => JSX.Element;
  navbarWidth?: number;
};

export function DefaultLayout({ children, Navbar, navbarWidth }: OwnProps) {
  const currentUser = useRecoilState(currentUserState);
  const userIsAuthenticated = !!currentUser;

  return (
    <StyledLayout>
      {userIsAuthenticated ? (
        <>
          <CommandMenu />
          <NavbarContainer>
            <Navbar />
          </NavbarContainer>
          <MainContainer navbarWidth={navbarWidth ?? DEFAULT_NAVBAR_WIDTH}>
            {children}
          </MainContainer>
        </>
      ) : (
        children
      )}
    </StyledLayout>
  );
}
