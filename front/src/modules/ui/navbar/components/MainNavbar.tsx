import styled from '@emotion/styled';

import NavItemsContainer from './NavItemsContainer';
import NavWorkspaceButton from './NavWorkspaceButton';
import SupportChat from './SupportChat';

type OwnProps = {
  children: React.ReactNode;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(2.5)};
  width: 100%;
`;

export default function MainNavbar({ children }: OwnProps) {
  return (
    <StyledContainer>
      <div>
        <NavWorkspaceButton />
        <NavItemsContainer>{children}</NavItemsContainer>
      </div>
      <SupportChat />
    </StyledContainer>
  );
}
