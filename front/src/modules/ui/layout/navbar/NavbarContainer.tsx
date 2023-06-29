import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { MOBILE_VIEWPORT } from '@/ui/themes/themes';

import { isNavbarOpenedState } from '../states/isNavbarOpenedState';

const StyledNavbarContainer = styled.div`
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(2)};
  width: ${(props) => (useRecoilValue(isNavbarOpenedState) ? 'auto' : '0')};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: ${(props) =>
      useRecoilValue(isNavbarOpenedState)
        ? `calc(100% - ` + props.theme.spacing(4) + `)`
        : '0'};
  }
`;

const NavbarContent = styled.div`
  display: ${() => (useRecoilValue(isNavbarOpenedState) ? 'block' : 'none')};
`;

interface NavbarProps {
  children: React.ReactNode;
  layout?: string;
}

export function NavbarContainer({ children, layout }: NavbarProps) {
  return (
    <StyledNavbarContainer>
      <NavbarContent>{children}</NavbarContent>
    </StyledNavbarContainer>
  );
}
