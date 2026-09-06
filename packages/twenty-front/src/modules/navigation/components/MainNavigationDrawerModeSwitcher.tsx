import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { motion, useReducedMotion } from 'framer-motion';
import { useContext, useId } from 'react';
import { AppTooltip, TooltipDelay, TooltipPosition } from 'twenty-ui/surfaces';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { useActiveNavigationDrawerMode } from '@/navigation/hooks/useActiveNavigationDrawerMode';
import { useIsNavigationDrawerContentExpanded } from '@/navigation/hooks/useIsNavigationDrawerContentExpanded';
import { useNavigationDrawerModes } from '@/navigation/hooks/useNavigationDrawerModes';
import { useSwitchNavigationDrawerMode } from '@/navigation/hooks/useSwitchNavigationDrawerMode';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

// Expanded, the row is sized off the page card header beside it so the rules
// read as one line across both columns. Collapsed, the modes stack into the
// icon rail and the rules would cut it in half, so they go.
const StyledSwitcher = styled.div<{ isExpanded: boolean }>`
  align-items: ${({ isExpanded }) => (isExpanded ? 'center' : 'flex-start')};
  border-bottom: ${({ isExpanded }) =>
    isExpanded ? `1px solid ${themeCssVariables.border.color.light}` : 'none'};
  border-top: ${({ isExpanded }) =>
    isExpanded ? `1px solid ${themeCssVariables.border.color.light}` : 'none'};
  box-sizing: border-box;
  display: flex;
  flex-direction: ${({ isExpanded }) => (isExpanded ? 'row' : 'column')};
  gap: ${({ isExpanded }) =>
    isExpanded
      ? themeCssVariables.spacing['0.5']
      : themeCssVariables.betweenSiblingsGap};
  height: ${({ isExpanded }) =>
    isExpanded ? themeCssVariables.spacing[10] : 'auto'};
`;

const StyledMode = styled.button<{ isActive: boolean; isExpanded: boolean }>`
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
  flex-shrink: 0;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${({ isActive, isExpanded }) =>
    isActive && isExpanded ? themeCssVariables.spacing[1] : '0'};
  height: ${themeCssVariables.spacing[7]};
  justify-content: ${({ isExpanded }) =>
    isExpanded ? 'flex-start' : 'center'};
  padding: ${({ isExpanded }) =>
    isExpanded ? `0 ${themeCssVariables.spacing['1.5']}` : '0'};
  transition:
    background calc(${themeCssVariables.animation.duration.fast} * 1s) ease,
    color calc(${themeCssVariables.animation.duration.fast} * 1s) ease,
    gap calc(${themeCssVariables.animation.duration.normal} * 1s) ease;
  width: ${({ isExpanded }) =>
    isExpanded ? 'auto' : themeCssVariables.spacing[6]};

  &:hover {
    background: ${({ isActive }) =>
      isActive
        ? themeCssVariables.background.transparent.light
        : themeCssVariables.background.transparent.lighter};
    color: ${themeCssVariables.font.color.primary};
  }
`;

const StyledModeIcon = styled.span`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  height: ${themeCssVariables.spacing[4]};
  justify-content: center;
  width: ${themeCssVariables.spacing[4]};
`;

const StyledModeLabelBase = styled.span`
  display: block;
  overflow: hidden;
  white-space: nowrap;
`;

const StyledModeLabel = motion.create(StyledModeLabelBase);

export const MainNavigationDrawerModeSwitcher = () => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const tooltipId = useId();

  const isMobile = useIsMobile();
  const isExpanded = useIsNavigationDrawerContentExpanded();
  const modes = useNavigationDrawerModes();
  const activeNavigationDrawerMode = useActiveNavigationDrawerMode();
  const { switchNavigationDrawerMode } = useSwitchNavigationDrawerMode();
  const shouldReduceMotion = useReducedMotion();

  if (modes.length === 0) {
    return null;
  }

  const shouldShowTooltips = !isExpanded && !isMobile;

  return (
    <>
      <StyledSwitcher
        isExpanded={isExpanded}
        role="group"
        aria-label={t`Navigation modes`}
      >
        {modes.map(({ Icon, label, mode }) => {
          const isActive = mode === activeNavigationDrawerMode;

          return (
            <StyledMode
              key={mode}
              type="button"
              data-tooltip-id={`${tooltipId}-${mode}`}
              isActive={isActive}
              isExpanded={isExpanded}
              aria-label={label}
              aria-current={isActive}
              onClick={() => switchNavigationDrawerMode(mode)}
            >
              <StyledModeIcon>
                <Icon size={theme.icon.size.md} />
              </StyledModeIcon>
              <StyledModeLabel
                initial={false}
                animate={{ width: isExpanded && isActive ? 'auto' : 0 }}
                transition={{
                  duration: shouldReduceMotion
                    ? 0
                    : theme.animation.duration.normal,
                  ease: 'easeInOut',
                }}
              >
                {label}
              </StyledModeLabel>
            </StyledMode>
          );
        })}
      </StyledSwitcher>
      {shouldShowTooltips &&
        modes.map(({ label, mode }) => (
          <AppTooltip
            key={mode}
            anchorSelect={`[data-tooltip-id='${tooltipId}-${mode}']`}
            content={label}
            delay={TooltipDelay.noDelay}
            place={TooltipPosition.Right}
            positionStrategy="fixed"
            noArrow
          />
        ))}
    </>
  );
};
