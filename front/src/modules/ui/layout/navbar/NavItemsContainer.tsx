import styled from '@emotion/styled';

type OwnProps = {
  children: React.ReactNode;
};

const StyledNavItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 40px;
`;

function NavItemsContainer({ children }: OwnProps) {
  return <StyledNavItemsContainer>{children}</StyledNavItemsContainer>;
}

export default NavItemsContainer;
