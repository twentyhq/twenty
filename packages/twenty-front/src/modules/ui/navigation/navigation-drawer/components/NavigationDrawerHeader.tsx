import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { workspacesState } from '@/auth/states/workspaces';
import { MultiWorkspaceDropdownButton } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdownButton';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { DEFAULT_WORKSPACE_NAME } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceName';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { NavigationDrawerCollapseButton } from './NavigationDrawerCollapseButton';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  height: ${({ theme }) => theme.spacing(7)};
  user-select: none;
`;

const StyledLogo = styled.div<{ logo: string }>`
  background: url(${({ logo }) => logo});
  background-position: center;
  background-size: cover;
  border-radius: ${({ theme }) => theme.border.radius.xs};
  height: 16px;
  width: 16px;
`;

const StyledName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-family: 'Inter';
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledNavigationDrawerCollapseButton = styled(
  NavigationDrawerCollapseButton,
)<{ show?: boolean }>`
  margin-left: auto;
  opacity: ${({ show }) => (show ? 1 : 0)};
  transition: opacity ${({ theme }) => theme.animation.duration.normal}s;
`;

type NavigationDrawerHeaderProps = {
  name?: string;
  logo?: string;
  showCollapseButton: boolean;
};

export const NavigationDrawerHeader = ({
  name = DEFAULT_WORKSPACE_NAME,
  logo = DEFAULT_WORKSPACE_LOGO,
  showCollapseButton,
}: NavigationDrawerHeaderProps) => {
  const isMobile = useIsMobile();
  const workspaces = useRecoilValue(workspacesState);

  return (
    <StyledContainer>
      {workspaces !== null && workspaces.length > 1 ? (
        <MultiWorkspaceDropdownButton workspaces={workspaces} />
      ) : (
        <>
          <StyledLogo logo={logo} />
          <StyledName>{name}</StyledName>
        </>
      )}

      {!isMobile && (
        <StyledNavigationDrawerCollapseButton
          direction="left"
          show={showCollapseButton}
        />
      )}
    </StyledContainer>
  );
};
