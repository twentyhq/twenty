import styled from '@emotion/styled';

import NavItemsContainer from './NavItemsContainer';
import NavWorkspaceButton from './NavWorkspaceButton';

type OwnProps = {
  children: JSX.Element;
};

const StyledContainer = styled.div`
  width: 220px;
`;

export default function MainNavbar({ children }: OwnProps) {
  return (
    <StyledContainer>
      <NavWorkspaceButton />
      <NavItemsContainer>{children}</NavItemsContainer>
    </StyledContainer>
  );
}
