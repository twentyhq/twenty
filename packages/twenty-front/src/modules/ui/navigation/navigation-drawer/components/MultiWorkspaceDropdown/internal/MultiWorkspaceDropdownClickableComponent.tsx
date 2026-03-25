import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import {
  StyledContainer,
  StyledIconChevronDown,
  StyledLabel,
  StyledLabelWrapper,
} from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/MultiWorkspacesDropdownStyles';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useContext } from 'react';
import { Avatar } from 'twenty-ui/display';
import { ThemeContext } from 'twenty-ui/theme-constants';

export const MultiWorkspaceDropdownClickableComponent = () => {
  const { theme } = useContext(ThemeContext);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const isNavigationDrawerExpanded = useAtomStateValue(
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
      <StyledLabelWrapper>
        <NavigationDrawerAnimatedCollapseWrapper>
          <StyledLabel>{currentWorkspace?.displayName ?? ''}</StyledLabel>
        </NavigationDrawerAnimatedCollapseWrapper>
      </StyledLabelWrapper>
      <NavigationDrawerAnimatedCollapseWrapper>
        <StyledIconChevronDown
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
        />
      </NavigationDrawerAnimatedCollapseWrapper>
    </StyledContainer>
  );
};
