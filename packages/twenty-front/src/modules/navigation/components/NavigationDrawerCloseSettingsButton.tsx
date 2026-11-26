import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconX } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import {
  StyledContainer,
  StyledLabel,
  StyledLabelWrapper,
} from '@/navigation/components/MultiWorkspaceDropdown/internal/MultiWorkspacesDropdownStyles';
import { useSwitchNavigationDrawerTab } from '@/navigation/hooks/useSwitchNavigationDrawerTab';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';

const StyledButton = styled.button`
  background: none;
  border: none;
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  font: inherit;
  max-width: 100%;
  min-width: 0;
  padding: 0;

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: -2px;
  }
`;

const StyledIconContainer = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
`;

export const NavigationDrawerCloseSettingsButton = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const isExpanded = useIsNavigationDrawerContentExpanded();
  const { switchToNavigationMenu } = useSwitchNavigationDrawerTab();

  const label = t`Close settings`;

  return (
    <StyledButton
      type="button"
      aria-label={label}
      onClick={switchToNavigationMenu}
    >
      <StyledContainer isNavigationDrawerExpanded={isExpanded}>
        <StyledIconContainer>
          <IconX size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        </StyledIconContainer>
        <StyledLabelWrapper aria-hidden>
          <NavigationDrawerAnimatedCollapseWrapper>
            <StyledLabel>{label}</StyledLabel>
          </NavigationDrawerAnimatedCollapseWrapper>
        </StyledLabelWrapper>
      </StyledContainer>
    </StyledButton>
  );
};
