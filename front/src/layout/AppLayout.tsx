import { Navbar } from './navbar/Navbar';
import styled from '@emotion/styled';
import { ThemeProvider } from '@emotion/react';
import { User } from '../interfaces/entities/user.interface';
import { lightTheme, darkTheme } from './styles/themes';

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

const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)');
const theme = isDarkMode ? darkTheme : lightTheme;

function AppLayout({ children, user }: OwnProps) {
  return (
    <ThemeProvider theme={theme}>
      <StyledLayout>
        <Navbar user={user} workspace={user?.workspaceMember?.workspace} />
        <MainContainer>{children}</MainContainer>
      </StyledLayout>
    </ThemeProvider>
  );
}

export default AppLayout;
