import styled from '@emotion/styled';

type OwnProps = {
  children: React.ReactNode;
};

const StyledNavItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 40px;
`;

const NavItemsContainer = ({ children }: OwnProps) => (
  <StyledNavItemsContainer>{children}</StyledNavItemsContainer>
);

export default NavItemsContainer;
