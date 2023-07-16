import styled from '@emotion/styled';
import { useRecoilState, useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { CommandMenu } from '@/command-menu/components/CommandMenu';
import { NavbarAnimatedContainer } from '@/ui/navbar/components/NavbarAnimatedContainer';
import { MOBILE_VIEWPORT } from '@/ui/themes/themes';
import { AppNavbar } from '~/AppNavbar';

import { isNavbarOpenedState } from '../states/isNavbarOpenedState';

const StyledLayout = styled.div`
  background: ${({ theme }) => theme.background.noisy};
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
      ? `calc(100% - ${NAVBAR_WIDTH})`
      : '100%'};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: ${() => (useRecoilValue(isNavbarOpenedState) ? '0' : '100%')};
  }
`;

type OwnProps = {
  children: JSX.Element;
};

export function DefaultLayout({ children }: OwnProps) {
  const currentUser = useRecoilState(currentUserState);
  const userIsAuthenticated = !!currentUser;

  return (
    <StyledLayout>
      {userIsAuthenticated ? (
        <>
          <CommandMenu />
          <NavbarAnimatedContainer>
            <AppNavbar />
          </NavbarAnimatedContainer>
          <MainContainer>{children}</MainContainer>
        </>
      ) : (
        children
      )}
    </StyledLayout>
  );
}
