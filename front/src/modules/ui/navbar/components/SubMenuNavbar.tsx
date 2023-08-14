import styled from '@emotion/styled';

import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import packageJson from '../../../../../package.json';
import { leftNavbarWidth } from '../constants';

import NavBackButton from './NavBackButton';
import NavItemsContainer from './NavItemsContainer';

type OwnProps = {
  children: React.ReactNode;
  backButtonTitle: string;
};

const StyledVersion = styled.div`
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  justify-content: center;
  span {
    color: ${({ theme }) => theme.font.color.tertiary};
  }
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
  padding-top: ${({ theme }) => theme.spacing(9)};
  width: ${() => (useIsMobile() ? '100%' : leftNavbarWidth.desktop)};
`;

export default function SubMenuNavbar({ children, backButtonTitle }: OwnProps) {
  const version = packageJson.version;

  return (
    <StyledContainer>
      <div>
        <NavBackButton title={backButtonTitle} />
        <NavItemsContainer>{children}</NavItemsContainer>
      </div>
      <StyledVersion>
        <span>Version {version}</span>
      </StyledVersion>
    </StyledContainer>
  );
}
