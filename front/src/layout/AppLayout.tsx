import Navbar from './navbar/Navbar';
import styled from '@emotion/styled';
import { User } from '../interfaces/user.interface';

const StyledLayout = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

type OwnProps = {
  children: JSX.Element;
  user?: User;
};

function AppLayout({ children, user }: OwnProps) {
  return (
    <StyledLayout>
      <Navbar user={user} />
      <div>{children}</div>
    </StyledLayout>
  );
}

export default AppLayout;
