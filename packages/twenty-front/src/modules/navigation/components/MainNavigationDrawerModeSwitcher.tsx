import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { motion, useReducedMotion } from 'framer-motion';
import { useContext } from 'react';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useActiveNavigationDrawerMode } from '@/navigation/hooks/useActiveNavigationDrawerMode';
import { useIsNavigationDrawerContentExpanded } from '@/navigation/hooks/useIsNavigationDrawerContentExpanded';
import { useNavigationDrawerModes } from '@/navigation/hooks/useNavigationDrawerModes';
import { useSwitchNavigationDrawerMode } from '@/navigation/hooks/useSwitchNavigationDrawerMode';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
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
  min-width: 0;
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
  // Only the mode showing a label may give ground. "AI" is two characters in
  // English and eighteen in Hebrew, and with every mode refusing to shrink the
  // row overflowed and pushed the last one - Settings - off the drawer.
  flex-shrink: ${({ isActive, isExpanded }) =>
    isActive && isExpanded ? 1 : 0};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${({ isActive, isExpanded }) =>
    isActive && isExpanded ? themeCssVariables.spacing[1] : '0'};
  height: ${themeCssVariables.spacing[7]};
  justify-content: ${({ isExpanded }) =>
    isExpanded ? 'flex-start' : 'center'};
  // A flex item will not shrink past its content without this, so flex-shrink
  // above would have nothing to act on.
  min-width: 0;
  padding: ${({ isExpanded }) =>
    isExpanded ? `0 ${themeCssVariables.spacing['1.5']}` : '0'};
  transition:
    background calc(${themeCssVariables.animation.duration.fast} * 1s) ease,
    color calc(${themeCssVariables.animation.duration.fast} * 1s) ease,
    gap calc(${themeCssVariables.animation.duration.normal} * 1s) ease;
  width: ${({ isExpanded }) =>
    isExpanded ? 'auto' : themeCssVariables.spacing[6]};

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
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledModeLabel = motion.create(StyledModeLabelBase);

export const MainNavigationDrawerModeSwitcher = () => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);

  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
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
    <StyledSwitcher
      isExpanded={isExpanded}
      role="group"
      aria-label={t`Navigation modes`}
    >
      {modes.map(({ Icon, label, mode }) => {
        const isActive = mode === activeNavigationDrawerMode;
        const isDisabled =
          mode !== NAVIGATION_DRAWER_TABS.NAVIGATION_MENU &&
          isLayoutCustomizationModeEnabled;

        return (
          <Tooltip
            key={mode}
            content={
              isDisabled
                ? mode === NAVIGATION_DRAWER_TABS.SETTINGS
                  ? t`Finish editing the layout to open Settings`
                  : t`Finish editing the layout to open AI`
                : label
            }
            disabled={!shouldShowTooltips && !isDisabled}
            delay={TooltipDelay.noDelay}
            side={isExpanded ? 'bottom' : 'right'}
            positionMethod="fixed"
          >
            <StyledMode
              type="button"
              isActive={isActive}
              isExpanded={isExpanded}
              aria-label={label}
              aria-current={isActive}
              aria-disabled={isDisabled}
              onClick={() => {
                if (isDisabled) {
                  return;
                }

                switchNavigationDrawerMode(mode);
              }}
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
          </Tooltip>
        );
      })}
    </StyledSwitcher>
  );
};
