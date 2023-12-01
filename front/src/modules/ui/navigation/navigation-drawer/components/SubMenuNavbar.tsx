import { ReactNode } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconBrandGithub } from '@/ui/display/icon';
import { MOBILE_VIEWPORT } from '@/ui/theme/constants/theme';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import packageJson from '../../../../../../package.json';
import { desktopNavDrawerWidths, githubLink } from '../constants';

import NavBackButton from './NavBackButton';
import NavItemsContainer from './NavItemsContainer';

type SubMenuNavbarProps = {
  children: ReactNode;
  backButtonTitle: string;
  displayVersion?: boolean;
};

const StyledVersionContainer = styled.div`
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(1)};
`;

const StyledVersion = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  padding-left: ${({ theme }) => theme.spacing(1)};

  :hover {
    color: ${({ theme }) => theme.font.color.tertiary};
  }
`;

const StyledVersionLink = styled.a`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  text-decoration: none;

  :hover {
    color: ${({ theme }) => theme.font.color.tertiary};
  }
`;

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(11)};
  width: ${desktopNavDrawerWidths.menu};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: 100%;
  }
`;

const SubMenuNavbar = ({
  children,
  backButtonTitle,
  displayVersion,
}: SubMenuNavbarProps) => {
  const version = packageJson.version;
  const isMobile = useIsMobile();

  const theme = useTheme();

  return (
    <StyledContainer>
      <div>
        {!isMobile && <NavBackButton title={backButtonTitle} />}
        <NavItemsContainer>{children}</NavItemsContainer>
      </div>
      {displayVersion && (
        <StyledVersionContainer>
          <StyledVersionLink href={githubLink} target="_blank" rel="noreferrer">
            <IconBrandGithub size={theme.icon.size.md} />
            <StyledVersion>{version}</StyledVersion>
          </StyledVersionLink>
        </StyledVersionContainer>
      )}
    </StyledContainer>
  );
};

export default SubMenuNavbar;
