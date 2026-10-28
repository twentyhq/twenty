import { NAVIGATION_DRAWER_COLLAPSED_BUTTON_SIZE } from '@/ui/navigation/navigation-drawer/constants/NavigationDrawerCollapsedButtonSize';
import { NAVIGATION_DRAWER_ITEM_HOVER_BACKGROUND } from '@/ui/navigation/navigation-drawer/constants/NavigationDrawerItemHoverBackground';
import { EASE_OUT_CSS } from '@/ui/theme/constants/EaseOutCss';
import { styled } from '@linaria/react';
import { IconChevronDown } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

export const StyledContainer = styled.div<{
  isNavigationDrawerExpanded: boolean;
  disabled?: boolean;
}>`
  align-items: center;
  border: 1px solid transparent;
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  display: flex;
  gap: ${({ isNavigationDrawerExpanded }) =>
    isNavigationDrawerExpanded ? themeCssVariables.spacing[2] : '0'};
  height: ${({ isNavigationDrawerExpanded }) =>
    isNavigationDrawerExpanded
      ? themeCssVariables.spacing[7]
      : `${NAVIGATION_DRAWER_COLLAPSED_BUTTON_SIZE}px`};
  max-width: 100%;
  min-width: 0;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  padding: ${({ isNavigationDrawerExpanded }) =>
    isNavigationDrawerExpanded
      ? `calc(${themeCssVariables.spacing[1]} - 1px)`
      : `calc(${themeCssVariables.spacing[2]} - 1px)`};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
  transition: background-color
    calc(${themeCssVariables.animation.duration.fast} * 1s) ${EASE_OUT_CSS};
  width: ${({ isNavigationDrawerExpanded }) =>
    isNavigationDrawerExpanded
      ? 'fit-content'
      : `${NAVIGATION_DRAWER_COLLAPSED_BUTTON_SIZE}px`};

  &:hover,
  [data-popup-open] > & {
    background-color: ${({ disabled }) =>
      disabled ? 'transparent' : NAVIGATION_DRAWER_ITEM_HOVER_BACKGROUND};
  }
`;

export const StyledLabelWrapper = styled.div`
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
`;

export const StyledLabel = styled.div`
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: -0.01em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledIconChevronDownContainer = styled.div<{ disabled?: boolean }>`
  align-items: center;
  color: ${({ disabled }) =>
    disabled
      ? themeCssVariables.font.color.extraLight
      : themeCssVariables.font.color.tertiary};
  display: flex;
`;

export const StyledIconChevronDown = ({
  disabled,
  ...props
}: { disabled?: boolean } & React.ComponentProps<typeof IconChevronDown>) => (
  <StyledIconChevronDownContainer disabled={disabled}>
    {/* oxlint-disable-next-line react/jsx-props-no-spreading */}
    <IconChevronDown {...props} />
  </StyledIconChevronDownContainer>
);
