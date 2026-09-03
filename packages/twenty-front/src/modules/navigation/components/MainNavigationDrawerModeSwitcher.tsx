import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import {
  type IconComponent,
  IconComment,
  IconHome,
  IconSettings,
} from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { useActiveNavigationDrawerMode } from '@/navigation/hooks/useActiveNavigationDrawerMode';
import { useSwitchNavigationDrawerMode } from '@/navigation/hooks/useSwitchNavigationDrawerMode';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useIsWorkspaceActivationStatusEqualsTo } from '@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import {
  type NavigationDrawerActiveTab,
  NAVIGATION_DRAWER_TABS,
} from '@/ui/navigation/states/navigationDrawerTabs';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { PermissionFlagType } from '~/generated-metadata/graphql';

// Sized off the page card header row beside it, so the rules read as one line
// across both columns.
const StyledSwitcher = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  border-top: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  gap: ${themeCssVariables.spacing['0.5']};
  height: ${themeCssVariables.spacing[10]};
`;

const StyledMode = styled.button<{ isActive: boolean }>`
  align-items: center;
  background: ${({ isActive }) =>
    isActive ? themeCssVariables.background.transparent.light : 'transparent'};
  border: none;
  border-radius: ${themeCssVariables.border.radius.smRound};
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
  gap: ${({ isActive }) => (isActive ? themeCssVariables.spacing[1] : '0')};
  height: ${themeCssVariables.spacing[7]};
  padding: 0 ${themeCssVariables.spacing['1.5']};
  transition:
    background calc(${themeCssVariables.animation.duration.fast} * 1s) ease,
    color calc(${themeCssVariables.animation.duration.fast} * 1s) ease,
    gap calc(${themeCssVariables.animation.duration.normal} * 1s) ease;

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

// The label of an inactive mode stays in the tree so the button keeps an
// accessible name, and the collapsed track wipes it open on activation.
const StyledModeLabel = styled.span<{ isActive: boolean }>`
  display: grid;
  grid-template-columns: ${({ isActive }) => (isActive ? '1fr' : '0fr')};
  transition: grid-template-columns
    calc(${themeCssVariables.animation.duration.normal} * 1s) ease;
`;

const StyledModeLabelText = styled.span`
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
`;

type NavigationDrawerMode = {
  Icon: IconComponent;
  label: string;
  mode: NavigationDrawerActiveTab;
};

export const MainNavigationDrawerModeSwitcher = () => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);

  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const activeNavigationDrawerMode = useActiveNavigationDrawerMode();
  const { switchNavigationDrawerMode } = useSwitchNavigationDrawerMode();

  const isWorkspaceSuspended = useIsWorkspaceActivationStatusEqualsTo(
    WorkspaceActivationStatus.SUSPENDED,
  );

  // A suspended workspace is held on the billing settings by the route guard,
  // so offering the modes it would bounce back from only flashes the user out
  // and in again.
  if (isWorkspaceSuspended) {
    return null;
  }

  const modes: NavigationDrawerMode[] = [
    {
      Icon: IconHome,
      label: t`Home`,
      mode: NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
    },
    ...(hasAiPermission
      ? [
          {
            Icon: IconComment,
            label: t`AI`,
            mode: NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
          },
        ]
      : []),
    {
      Icon: IconSettings,
      label: t`Settings`,
      mode: NAVIGATION_DRAWER_TABS.SETTINGS,
    },
  ];

  return (
    <NavigationDrawerAnimatedCollapseWrapper>
      <StyledSwitcher role="group" aria-label={t`Navigation modes`}>
        {modes.map(({ Icon, label, mode }) => {
          const isActive = mode === activeNavigationDrawerMode;

          return (
            <StyledMode
              key={mode}
              type="button"
              isActive={isActive}
              aria-current={isActive}
              onClick={() => switchNavigationDrawerMode(mode)}
            >
              <StyledModeIcon>
                <Icon size={theme.icon.size.md} />
              </StyledModeIcon>
              <StyledModeLabel isActive={isActive}>
                <StyledModeLabelText>{label}</StyledModeLabelText>
              </StyledModeLabel>
            </StyledMode>
          );
        })}
      </StyledSwitcher>
    </NavigationDrawerAnimatedCollapseWrapper>
  );
};
