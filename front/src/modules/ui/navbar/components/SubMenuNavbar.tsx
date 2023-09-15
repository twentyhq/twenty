import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconBrandGithub } from '@/ui/icon';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import packageJson from '../../../../../package.json';
import { githubLink, leftNavbarWidth } from '../constants';

import NavBackButton from './NavBackButton';
import NavItemsContainer from './NavItemsContainer';

type OwnProps = {
  children: React.ReactNode;
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
  :hover {
    color: ${({ theme }) => theme.font.color.tertiary};
  }
  padding-left: ${({ theme }) => theme.spacing(1)};
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
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
  padding-top: ${({ theme }) => theme.spacing(9)};
  width: ${() => (useIsMobile() ? '100%' : leftNavbarWidth.desktop)};
`;

const SubMenuNavbar = ({
  children,
  backButtonTitle,
  displayVersion,
}: OwnProps) => {
  const version = packageJson.version;

  const theme = useTheme();

  return (
    <StyledContainer>
      <div>
        <NavBackButton title={backButtonTitle} />
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
