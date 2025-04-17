import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import {
  StyledContainer,
  StyledIconChevronDown,
  StyledLabel,
} from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/MultiWorkspacesDropdownStyles';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValue } from 'recoil';
import { useTheme } from '@emotion/react';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { Avatar } from 'twenty-ui/display';

export const MultiWorkspaceDropdownClickableComponent = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const theme = useTheme();

  const isNavigationDrawerExpanded = useRecoilValue(
    isNavigationDrawerExpandedState,
  );
  return (
    <StyledContainer
      data-testid="workspace-dropdown"
      isNavigationDrawerExpanded={isNavigationDrawerExpanded}
    >
      <Avatar
        placeholder={currentWorkspace?.displayName || ''}
        avatarUrl={currentWorkspace?.logo ?? DEFAULT_WORKSPACE_LOGO}
      />
      <NavigationDrawerAnimatedCollapseWrapper>
        <StyledLabel>{currentWorkspace?.displayName ?? ''}</StyledLabel>
      </NavigationDrawerAnimatedCollapseWrapper>
      <NavigationDrawerAnimatedCollapseWrapper>
        <StyledIconChevronDown
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
        />
      </NavigationDrawerAnimatedCollapseWrapper>
    </StyledContainer>
  );
};
