import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { CommandMenu } from '@/search/components/CommandMenu';
import { currentUserState } from '@/auth/states/currentUserState';

import { Navbar } from './navbar/Navbar';

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
  display: flex;
  flex-direction: row;
  width: calc(100% - ${NAVBAR_WIDTH});
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
