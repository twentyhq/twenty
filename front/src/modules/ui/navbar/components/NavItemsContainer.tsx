import styled from '@emotion/styled';

type NavItemsContainerProps = {
  children: React.ReactNode;
};

const StyledNavItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 40px;
`;

const NavItemsContainer = ({ children }: NavItemsContainerProps) => (
  <StyledNavItemsContainer>{children}</StyledNavItemsContainer>
);

export default NavItemsContainer;
