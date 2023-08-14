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

const StyledVersion = styled.div`
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  span {
    color: ${({ theme }) => theme.font.color.light};
    :hover {
      color: ${({ theme }) => theme.font.color.tertiary};
    }
    padding-left: ${({ theme }) => theme.spacing(1)};
  }
  a {
    align-items: center;
    color: ${({ theme }) => theme.font.color.light};
    display: flex;
    text-decoration: none;
    :hover {
      color: ${({ theme }) => theme.font.color.tertiary};
    }
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

export default function SubMenuNavbar({
  children,
  backButtonTitle,
  displayVersion,
}: OwnProps) {
  const version = packageJson.version;

  return (
    <StyledContainer>
      <div>
        <NavBackButton title={backButtonTitle} />
        <NavItemsContainer>{children}</NavItemsContainer>
      </div>
      {displayVersion && (
        <StyledVersion>
          <a href={githubLink} target="_blank" rel="noreferrer">
            <IconBrandGithub size={16} />
            <span>{version}</span>
          </a>
        </StyledVersion>
      )}
    </StyledContainer>
  );
}
