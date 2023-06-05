import styled from '@emotion/styled';

import { User } from '@/users/interfaces/user.interface';

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
  user?: User;
};

export function AppLayout({ children, user }: OwnProps) {
  const userIsAuthenticated = !!user;
  return (
    <StyledLayout>
      {userIsAuthenticated ? (
        <>
          <Navbar user={user} workspace={user?.workspaceMember?.workspace} />
          <MainContainer>{children}</MainContainer>
        </>
      ) : (
        children
      )}
    </StyledLayout>
  );
}
