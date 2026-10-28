import { type NavigationDrawerAttention } from '@/navigation/types/NavigationDrawerAttention';
import { StyledNavigationDrawerAttentionDot } from '@/navigation/components/StyledNavigationDrawerAttentionDot';
import { NAVIGATION_DRAWER_COLLAPSED_BUTTON_SIZE } from '@/ui/navigation/navigation-drawer/constants/NavigationDrawerCollapsedButtonSize';
import { styled } from '@linaria/react';
import { motion, useReducedMotion } from 'framer-motion';
import { type MouseEvent, type Ref } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { type IconComponent } from 'twenty-ui/icon';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';

const StyledMode = styled.button<{
  isActive: boolean;
  isExpanded: boolean;
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
  flex-shrink: ${({ isActive, isExpanded }) =>
    isActive && isExpanded ? 1 : 0};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${({ isActive, isExpanded }) =>
    isActive && isExpanded ? themeCssVariables.spacing[1] : '0'};
  height: ${({ isExpanded }) =>
    isExpanded
      ? themeCssVariables.spacing[7]
      : `${NAVIGATION_DRAWER_COLLAPSED_BUTTON_SIZE}px`};
  justify-content: ${({ isExpanded }) =>
    isExpanded ? 'flex-start' : 'center'};
  min-width: 0;
  outline: ${({ isSelectedInEditMode }) =>
    isSelectedInEditMode
      ? `1px solid ${themeCssVariables.color.blue}`
      : 'none'};
  outline-offset: -1px;
  padding: ${({ isExpanded }) =>
    isExpanded ? `0 ${themeCssVariables.spacing['1.5']}` : '0'};
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
    outline: 2px solid ${themeCssVariables.color.blue};
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

type MainNavigationDrawerModeButtonProps = {
  Icon: IconComponent;
  label: string;
  ariaLabel?: string;
  tooltip: string;
  isTooltipDisabled: boolean;
  isActive: boolean;
  isExpanded: boolean;
  isDisabled?: boolean;
  attention?: NavigationDrawerAttention | null;
  isSelectedInEditMode?: boolean;
  buttonRef?: Ref<HTMLButtonElement>;
  onClick: () => void;
  onContextMenu?: (event: MouseEvent<HTMLButtonElement>) => void;
};

export const MainNavigationDrawerModeButton = ({
  Icon,
  label,
  ariaLabel,
  tooltip,
  isTooltipDisabled,
  isActive,
  isExpanded,
  isDisabled = false,
  attention,
  isSelectedInEditMode = false,
  buttonRef,
  onClick,
  onContextMenu,
}: MainNavigationDrawerModeButtonProps) => {
  const theme = useTheme();
  const shouldReduceMotion = useReducedMotion();

  return (
    <Tooltip
      content={tooltip}
      disabled={isTooltipDisabled}
      delay={TooltipDelay.noDelay}
      side={isExpanded ? 'bottom' : 'right'}
      positionMethod="fixed"
    >
      <StyledMode
        ref={buttonRef}
        type="button"
        isActive={isActive}
        isExpanded={isExpanded}
        isSelectedInEditMode={isSelectedInEditMode}
        aria-label={ariaLabel ?? label}
        aria-current={isActive || undefined}
        aria-disabled={isDisabled}
        onClick={() => {
          if (isDisabled) {
            return;
          }

          onClick();
        }}
        onContextMenu={onContextMenu}
      >
        <StyledModeIcon>
          <Icon size={theme.icon.size.md} />
          {isDefined(attention) && (
            <StyledNavigationDrawerAttentionDot data-attention={attention} />
          )}
        </StyledModeIcon>
        <StyledModeLabel
          initial={false}
          animate={{ width: isExpanded && isActive ? 'auto' : 0 }}
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
