import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconX } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { useSwitchNavigationDrawerTab } from '@/navigation/hooks/useSwitchNavigationDrawerTab';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NAVIGATION_DRAWER_COLLAPSED_BUTTON_SIZE } from '@/ui/navigation/navigation-drawer/constants/NavigationDrawerCollapsedButtonSize';
import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';

const StyledButton = styled.button<{ isNavigationDrawerExpanded: boolean }>`
  align-items: center;
  background: none;
  border: 1px solid transparent;
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: flex;
  font: inherit;
  gap: ${({ isNavigationDrawerExpanded }) =>
    isNavigationDrawerExpanded ? themeCssVariables.spacing[2] : '0'};
  height: ${({ isNavigationDrawerExpanded }) =>
    isNavigationDrawerExpanded
      ? themeCssVariables.spacing[7]
      : `${NAVIGATION_DRAWER_COLLAPSED_BUTTON_SIZE}px`};
  max-width: 100%;
  min-width: 0;
  padding: ${({ isNavigationDrawerExpanded }) =>
    isNavigationDrawerExpanded
      ? `calc(${themeCssVariables.spacing[1]} - 1px)`
      : `calc(${themeCssVariables.spacing[2]} - 1px)`};
  width: ${({ isNavigationDrawerExpanded }) =>
    isNavigationDrawerExpanded
      ? 'fit-content'
      : `${NAVIGATION_DRAWER_COLLAPSED_BUTTON_SIZE}px`};

  &:hover {
    background-color: ${themeCssVariables.background.transparent.lighter};
    border-color: ${themeCssVariables.border.color.medium};
  }

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

const StyledLabelWrapper = styled.div`
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
`;

const StyledLabel = styled.div`
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
      isNavigationDrawerExpanded={isExpanded}
      onClick={switchToNavigationMenu}
    >
      <StyledIconContainer>
        <IconX size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
      </StyledIconContainer>
      <StyledLabelWrapper aria-hidden>
        <NavigationDrawerAnimatedCollapseWrapper>
          <StyledLabel>{label}</StyledLabel>
        </NavigationDrawerAnimatedCollapseWrapper>
      </StyledLabelWrapper>
    </StyledButton>
  );
};
