import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { workspacesState } from '@/auth/states/workspaces';
import { MultiWorkspaceDropdownButton } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdownButton';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { Avatar } from 'twenty-ui';
import { NavigationDrawerCollapseButton } from './NavigationDrawerCollapseButton';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  height: ${({ theme }) => theme.spacing(8)};
  user-select: none;
`;

const StyledSingleWorkspaceContainer = styled(StyledContainer)`
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(1)};
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
  name: string;
  logo: string;
  showCollapseButton: boolean;
};

export const NavigationDrawerHeader = ({
  name,
  logo,
  showCollapseButton,
}: NavigationDrawerHeaderProps) => {
  const isMobile = useIsMobile();
  const workspaces = useRecoilValue(workspacesState);
  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);

  const isNavigationDrawerExpanded = useRecoilValue(
    isNavigationDrawerExpandedState,
  );

  const isMultiWorkspace =
    isMultiWorkspaceEnabled && workspaces !== null && workspaces.length > 1;

  return (
    <StyledContainer>
      {isMultiWorkspace ? (
        <MultiWorkspaceDropdownButton workspaces={workspaces} />
      ) : (
        <StyledSingleWorkspaceContainer>
          <Avatar placeholder={name} avatarUrl={logo} />
          <NavigationDrawerAnimatedCollapseWrapper>
            <StyledName>{name}</StyledName>
          </NavigationDrawerAnimatedCollapseWrapper>
        </StyledSingleWorkspaceContainer>
      )}
      {!isMobile && isNavigationDrawerExpanded && (
        <StyledNavigationDrawerCollapseButton
          direction="left"
          show={showCollapseButton}
        />
      )}
    </StyledContainer>
  );
};
