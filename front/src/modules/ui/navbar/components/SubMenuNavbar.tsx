import styled from '@emotion/styled';

import { useIsMobile } from '../../../../hooks/useIsMobile';

import NavBackButton from './NavBackButton';
import NavItemsContainer from './NavItemsContainer';

type OwnProps = {
  children: React.ReactNode;
  backButtonTitle: string;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: ${({ theme }) => theme.spacing(2)};
  width: ${({ theme }) =>
    useIsMobile() ? '100%' : theme.leftNavBarWidth.desktop};
`;

export default function SubMenuNavbar({ children, backButtonTitle }: OwnProps) {
  return (
    <StyledContainer>
      <NavBackButton title={backButtonTitle} />
      <NavItemsContainer>{children}</NavItemsContainer>
    </StyledContainer>
  );
}
