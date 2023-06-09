import styled from '@emotion/styled';
import { useRecoilState, useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { CommandMenu } from '@/search/components/CommandMenu';

import { Navbar } from './navbar/Navbar';
import { navbarState } from './states/navbarState';
import { MOBILE_VIEWPORT } from './styles/themes';

const StyledLayout = styled.div`
  display: flex;
  flex-direction: row;
  width: 100vw;
  height: 100vh;
  background: ${(props) => props.theme.noisyBackground};
  position: relative;
`;

const NAVBAR_WIDTH = '236px';

const MainContainer = styled.div`
  overflow: hidden;
  display: flex;
  flex-direction: row;
  width: ${() =>
    useRecoilValue(navbarState) ? `(calc(100% -  ${NAVBAR_WIDTH})` : '100%'};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: ${() => (useRecoilValue(navbarState) ? '0' : '100%')};
  }
`;

type OwnProps = {
  children: JSX.Element;
};

export function AppLayout({ children }: OwnProps) {
  const currentUser = useRecoilState(currentUserState);
  const userIsAuthenticated = !!currentUser;

  return (
    <StyledLayout>
      {userIsAuthenticated ? (
        <>
          <CommandMenu />
          <Navbar />
          <MainContainer>{children}</MainContainer>
        </>
      ) : (
        children
      )}
    </StyledLayout>
  );
}
