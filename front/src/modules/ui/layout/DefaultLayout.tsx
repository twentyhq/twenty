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

const NAVBAR_WIDTH = '236px';

const MainContainer = styled.div`
  display: flex;
  flex-direction: row;
  overflow: hidden;
  width: ${() =>
    useRecoilValue(isNavbarOpenedState)
      ? `(calc(100% -  ${NAVBAR_WIDTH})`
      : '100%'};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: ${() => (useRecoilValue(isNavbarOpenedState) ? '0' : '100%')};
  }
`;

type OwnProps = {
  children: JSX.Element;
  Navbar: () => JSX.Element;
};

export function DefaultLayout({ children, Navbar }: OwnProps) {
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
          <MainContainer>{children}</MainContainer>
        </>
      ) : (
        children
      )}
    </StyledLayout>
  );
}
