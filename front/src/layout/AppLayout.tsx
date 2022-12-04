import Navbar from './navbar/Navbar';
import styled from '@emotion/styled';

const StyledLayout = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

type OwnProps = {
  children: JSX.Element;
};

function AppLayout({ children }: OwnProps) {
  return (
    <StyledLayout>
      <Navbar />
      <div>{children}</div>
    </StyledLayout>
  );
}

export default AppLayout;
