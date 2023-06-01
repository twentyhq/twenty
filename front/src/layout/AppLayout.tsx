import { Navbar } from './navbar/Navbar';
import styled from '@emotion/styled';
import { User } from '../interfaces/entities/user.interface';

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

function AppLayout({ children, user }: OwnProps) {
  return (
    <StyledLayout>
      <Navbar user={user} workspace={user?.workspaceMember?.workspace} />
      <MainContainer>{children}</MainContainer>
    </StyledLayout>
  );
}

export default AppLayout;
