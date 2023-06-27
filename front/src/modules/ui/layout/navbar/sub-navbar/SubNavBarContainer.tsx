import styled from '@emotion/styled';

import NavBackButton from './NavBackButton';

type OwnProps = {
  children: JSX.Element;
  backButtonTitle: string;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 300px;
  padding-top: ${({ theme }) => theme.spacing(6)};
`;

const StyledNavItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export default function SubNavbarContainer({
  children,
  backButtonTitle,
}: OwnProps) {
  return (
    <StyledContainer>
      <NavBackButton title={backButtonTitle} />
      <StyledNavItemsContainer>{children}</StyledNavItemsContainer>
    </StyledContainer>
  );
}
