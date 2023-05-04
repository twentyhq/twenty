import Navbar from './navbar/Navbar';
import styled from '@emotion/styled';
import { ThemeProvider } from '@emotion/react';
import { User } from '../interfaces/user.interface';
import { lightTheme } from './styles/themes';

const StyledLayout = styled.div`
  display: flex;
  flex-direction: row;
  width: 100vw;
  height: 100vh;
`;

const StyledRightContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  overflow: hidden;
`;

type OwnProps = {
  children: JSX.Element;
  user?: User;
};

function AppLayout({ children, user }: OwnProps) {
  return (
    <ThemeProvider theme={lightTheme}>
      <StyledLayout>
        <Navbar user={user} workspace={user?.workspace_member?.workspace} />
        <StyledRightContainer>{children}</StyledRightContainer>
      </StyledLayout>
    </ThemeProvider>
  );
}

export default AppLayout;
