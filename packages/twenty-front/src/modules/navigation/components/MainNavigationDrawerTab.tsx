import { NAVIGATION_DRAWER_COLLAPSED_BUTTON_SIZE } from '@/ui/navigation/navigation-drawer/constants/NavigationDrawerCollapsedButtonSize';
import { styled } from '@linaria/react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  type ComponentPropsWithRef,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { type IconComponent } from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';

const StyledMode = styled.button<{
  isActive: boolean;
  isExpanded: boolean;
  isLabelHidden: boolean;
  isLabelShown: boolean;
  isSelectedInEditMode: boolean;
}>`
  align-items: center;
  background: ${({ isActive }) =>
    isActive ? themeCssVariables.background.transparent.light : 'transparent'};
  border: none;
  border-radius: ${({ isExpanded }) =>
    isExpanded
      ? themeCssVariables.border.radius.smRound
      : themeCssVariables.border.radius.mdRound};
  color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.tertiary};
  corner-shape: round;
  cursor: pointer;
  display: flex;
  // Only the labelled mode may shrink: long translations otherwise push Settings off the drawer.
  flex-shrink: ${({ isLabelShown }) => (isLabelShown ? 1 : 0)};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${({ isLabelShown }) =>
    isLabelShown ? themeCssVariables.spacing[1] : '0'};
  height: ${({ isExpanded, isLabelHidden }) =>
    isExpanded && !isLabelHidden
      ? themeCssVariables.spacing[7]
      : `${NAVIGATION_DRAWER_COLLAPSED_BUTTON_SIZE}px`};
  justify-content: ${({ isExpanded }) =>
    isExpanded ? 'flex-start' : 'center'};
  min-width: 0;
  outline: ${({ isSelectedInEditMode }) =>
    isSelectedInEditMode
      ? `1px solid ${themeCssVariables.accent.accent9}`
      : 'none'};
  outline-offset: -1px;
  padding: ${({ isExpanded, isLabelHidden }) =>
    isExpanded
      ? `0 ${isLabelHidden ? themeCssVariables.spacing[2] : themeCssVariables.spacing['1.5']}`
      : '0'};
  transition:
    background calc(${themeCssVariables.animation.duration.fast} * 1s) ease,
    color calc(${themeCssVariables.animation.duration.fast} * 1s) ease,
    gap calc(${themeCssVariables.animation.duration.normal} * 1s) ease;
  width: ${({ isExpanded }) =>
    isExpanded ? 'auto' : `${NAVIGATION_DRAWER_COLLAPSED_BUTTON_SIZE}px`};

  &[aria-disabled='true'] {
    color: ${themeCssVariables.font.color.light};
    cursor: not-allowed;
  }

  &:hover:not([aria-disabled='true']) {
    background: ${({ isActive }) =>
      isActive
        ? themeCssVariables.background.transparent.light
        : themeCssVariables.background.transparent.lighter};
    color: ${themeCssVariables.font.color.primary};
  }

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.accent.accent9};
    outline-offset: 1px;
  }
`;

const StyledModeIcon = styled.span`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  height: ${themeCssVariables.spacing[4]};
  justify-content: center;
  position: relative;
  width: ${themeCssVariables.spacing[4]};
`;

const StyledModeLabelBase = styled.span`
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledModeLabel = motion.create(StyledModeLabelBase);

type MainNavigationDrawerTabProps = Omit<
  ComponentPropsWithRef<'button'>,
  'onClick'
> & {
  Icon: IconComponent;
  label: string;
  isActive: boolean;
  isExpanded: boolean;
  isDisabled: boolean;
  tooltip: string;
  shouldShowTooltip: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  ariaLabel?: string;
  iconAccessory?: ReactNode;
  isLabelHidden?: boolean;
  isSelectedInEditMode?: boolean;
};

export const MainNavigationDrawerTab = ({
  Icon,
  label,
  isActive,
  isExpanded,
  isDisabled,
  tooltip,
  shouldShowTooltip,
  onClick,
  ariaLabel,
  iconAccessory,
  isLabelHidden = false,
  isSelectedInEditMode = false,
  ...buttonProps
}: MainNavigationDrawerTabProps) => {
  const theme = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const isLabelShown = isExpanded && isActive && !isLabelHidden;

  const getTooltipSide = () => {
    if (!isExpanded) {
      return 'right';
    }

    return isLabelHidden ? 'top' : 'bottom';
  };

  return (
    <Tooltip
      content={tooltip}
      disabled={!shouldShowTooltip && !isDisabled}
      delay={TooltipDelay.noDelay}
      side={getTooltipSide()}
      positionMethod="fixed"
    >
      <StyledMode
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...buttonProps}
        type="button"
        isActive={isActive}
        isExpanded={isExpanded}
        isLabelHidden={isLabelHidden}
        isLabelShown={isLabelShown}
        isSelectedInEditMode={isSelectedInEditMode}
        aria-label={ariaLabel ?? label}
        aria-current={isActive || undefined}
        aria-disabled={isDisabled}
        onClick={(event) => {
          if (isDisabled) {
            return;
          }

          onClick(event);
        }}
      >
        <StyledModeIcon>
          <Icon size={theme.icon.size.md} />
          {iconAccessory}
        </StyledModeIcon>
        <StyledModeLabel
          initial={false}
          animate={{ width: isLabelShown ? 'auto' : 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : theme.animation.duration.normal,
            ease: 'easeInOut',
          }}
        >
          {label}
        </StyledModeLabel>
      </StyledMode>
    </Tooltip>
  );
};
