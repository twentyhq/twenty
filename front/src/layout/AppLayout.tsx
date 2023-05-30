import { Navbar } from './navbar/Navbar';
import styled from '@emotion/styled';
import { ThemeProvider } from '@emotion/react';
import { User } from '../interfaces/entities/user.interface';
import { lightTheme } from './styles/themes';

const StyledLayout = styled.div`
  display: flex;
  flex-direction: row;
  width: 100vw;
  height: 100vh;
  background: ${(props) => props.theme.noisyBackground};
  overflow: hidden;
`;

const MainContainer = styled.div`
  display: flex;
  flex-direction: row;
  overflow: hidden;
  widht: calc(100% - 220px);
`;

type OwnProps = {
  children: JSX.Element;
  user?: User;
};

function AppLayout({ children, user }: OwnProps) {
  return (
    <ThemeProvider theme={lightTheme}>
      <StyledLayout>
        <Navbar user={user} workspace={user?.workspaceMember?.workspace} />
        <MainContainer>{children}</MainContainer>
      </StyledLayout>
    </ThemeProvider>
  );
}

export default AppLayout;
