import styled from '@emotion/styled';

import NavItemsContainer from '../NavItemsContainer';

import NavBackButton from './NavBackButton';

type OwnProps = {
  children: JSX.Element;
  backButtonTitle: string;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: ${({ theme }) => theme.spacing(6)};
  width: 220px;
`;

export default function SubNavbar({ children, backButtonTitle }: OwnProps) {
  return (
    <StyledContainer>
      <NavBackButton title={backButtonTitle} />
      <NavItemsContainer>{children}</NavItemsContainer>
    </StyledContainer>
  );
}
