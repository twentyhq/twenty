import styled from '@emotion/styled';

import NavItemsContainer from './NavItemsContainer';
import NavWorkspaceButton from './NavWorkspaceButton';

type OwnProps = {
  children: JSX.Element;
};

const StyledContainer = styled.div`
  width: ${({ theme }) => theme.leftNavBarWidth};
`;

export default function MainNavbar({ children }: OwnProps) {
  return (
    <StyledContainer>
      <NavWorkspaceButton />
      <NavItemsContainer>{children}</NavItemsContainer>
    </StyledContainer>
  );
}
