import Navbar from './navbar/Navbar';
import styled from '@emotion/styled';

const StyledLayout = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

type OwnProps = {
  children: JSX.Element;
  user?: {
    email: string;
    first_name: string;
    last_name: string;
    tenant: { id: string; name: string };
  };
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
