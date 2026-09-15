import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import {
  StyledContainer,
  StyledIconChevronDown,
  StyledLabel,
  StyledLabelWrapper,
} from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/MultiWorkspacesDropdownStyles';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { useIsNavigationDrawerContentExpanded } from '@/navigation/hooks/useIsNavigationDrawerContentExpanded';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';
import { useContext } from 'react';
import { styled } from '@linaria/react';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledAvatar = styled(Avatar)<{ isExpanded: boolean }>`
  && {
    block-size: ${({ isExpanded }) =>
      isExpanded ? themeCssVariables.spacing[4] : themeCssVariables.spacing[8]};
    inline-size: ${({ isExpanded }) =>
      isExpanded ? themeCssVariables.spacing[4] : themeCssVariables.spacing[8]};
  }
`;

type MultiWorkspaceDropdownClickableComponentProps = {
  disabled?: boolean;
  shouldHideLabel?: boolean;
};

export const MultiWorkspaceDropdownClickableComponent = ({
  disabled,
  shouldHideLabel = false,
}: MultiWorkspaceDropdownClickableComponentProps) => {
  const { theme } = useContext(ThemeContext);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const isNavigationDrawerExpanded = useIsNavigationDrawerContentExpanded();
  return (
    <StyledContainer
      data-testid="workspace-dropdown"
      isNavigationDrawerExpanded={isNavigationDrawerExpanded}
      disabled={disabled}
    >
      <StyledAvatar
        isExpanded={isNavigationDrawerExpanded}
        size={isNavigationDrawerExpanded ? 'md' : 'xl'}
        name={currentWorkspace?.displayName || ''}
        src={getAbsoluteImageUrl(
          currentWorkspace?.logo ?? DEFAULT_WORKSPACE_LOGO,
        )}
      />
      {!shouldHideLabel && (
        <>
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
        </>
      )}
    </StyledContainer>
  );
};
