import styled from '@emotion/styled';

import NavItemsContainer from './NavItemsContainer';
import NavWorkspaceButton from './NavWorkspaceButton';

type OwnProps = {
  children: React.ReactNode;
};

const StyledContainer = styled.div`
  width: 100%;
`;

export default function MainNavbar({ children }: OwnProps) {
  return (
    <StyledContainer>
      <NavWorkspaceButton />
      <NavItemsContainer>{children}</NavItemsContainer>
    </StyledContainer>
  );
}
