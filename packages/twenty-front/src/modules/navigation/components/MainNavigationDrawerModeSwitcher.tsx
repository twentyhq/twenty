import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Badge } from 'twenty-ui/primitives/data-display';
import { useIcons } from 'twenty-ui/icon/provider';
import { themeCssVariables } from 'twenty-ui/theme';
import { isDefined } from 'twenty-shared/utils';

import { useInboxOpenThreadsSummary } from '@/inbox/hooks/useInboxOpenThreadsSummary';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { NAVIGATION_MENU_TAB_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/NavigationMenuTabIconDefault';
import { useActiveNavigationMenuTab } from '@/navigation-menu-item/display/hooks/useActiveNavigationMenuTab';
import { useWorkspaceNavigationMenuTabs } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuTabs';
import { MainNavigationDrawerModeButton } from '@/navigation/components/MainNavigationDrawerModeButton';
import { useActiveNavigationDrawerMode } from '@/navigation/hooks/useActiveNavigationDrawerMode';
import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { useNavigationDrawerModes } from '@/navigation/hooks/useNavigationDrawerModes';
import { useSwitchNavigationDrawerMode } from '@/navigation/hooks/useSwitchNavigationDrawerMode';
import {
  type NavigationDrawerActiveTab,
  NAVIGATION_DRAWER_TABS,
} from '@/ui/navigation/states/navigationDrawerTabs';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { useIsMobile } from 'twenty-ui/utilities';

const MAX_DISPLAYED_UNREAD_COUNT = 99;

// Expanded, the row matches the page card header so their borders read as one line.
const StyledSwitcher = styled.div<{ isExpanded: boolean }>`
  align-items: ${({ isExpanded }) => (isExpanded ? 'center' : 'flex-start')};
  border-bottom: ${({ isExpanded }) =>
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

const StyledUnreadBadge = styled.span`
  pointer-events: none;
  position: absolute;
  right: calc(-1 * ${themeCssVariables.spacing['1.5']});
  top: calc(-1 * ${themeCssVariables.spacing['1.5']});
`;

export const MainNavigationDrawerModeSwitcher = () => {
  const { t } = useLingui();
  const { getIcon } = useIcons();

  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const isMobile = useIsMobile();
  const isExpanded = useIsNavigationDrawerContentExpanded();
  const modes = useNavigationDrawerModes();
  const activeNavigationDrawerMode = useActiveNavigationDrawerMode();
  const { switchNavigationDrawerMode, switchToNavigationMenuTab } =
    useSwitchNavigationDrawerMode();
  const navigationMenuTabs = useWorkspaceNavigationMenuTabs();
  const activeNavigationMenuTab = useActiveNavigationMenuTab();
  const { unreadOpenThreadCount } = useInboxOpenThreadsSummary();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );

  const getDisabledModeTooltip = (mode: NavigationDrawerActiveTab) => {
    if (mode === NAVIGATION_DRAWER_TABS.SETTINGS) {
      return t`Finish editing the layout to open Settings`;
    }

    return isAiChatInboxEnabled
      ? t`Finish editing the layout to open Inbox`
      : t`Finish editing the layout to open AI`;
  };

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
        const isActive =
          mode === activeNavigationDrawerMode &&
          !(
            mode === NAVIGATION_DRAWER_TABS.NAVIGATION_MENU &&
            isDefined(activeNavigationMenuTab)
          );
        // Inside the inbox, its Open item already shows what is unread
        const isUnread =
          isAiChatInboxEnabled &&
          mode === NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY &&
          unreadOpenThreadCount > 0 &&
          !isActive;
        const isDisabled =
          mode !== NAVIGATION_DRAWER_TABS.NAVIGATION_MENU &&
          isLayoutCustomizationModeEnabled;

        const modeButton = (
          <MainNavigationDrawerModeButton
            key={mode}
            Icon={Icon}
            label={label}
            isActive={isActive}
            isExpanded={isExpanded}
            isDisabled={isDisabled}
            tooltip={isDisabled ? getDisabledModeTooltip(mode) : label}
            shouldShowTooltip={shouldShowTooltips}
            ariaLabel={
              isUnread ? t`${label}, ${unreadOpenThreadCount} unread` : label
            }
            onClick={() => switchNavigationDrawerMode(mode)}
            iconAccessory={
              isUnread && (
                <Badge
                  render={<StyledUnreadBadge />}
                  aria-hidden="true"
                  size="xs"
                  color="red"
                  shape={unreadOpenThreadCount < 10 ? 'circle' : 'pill'}
                >
                  {unreadOpenThreadCount > MAX_DISPLAYED_UNREAD_COUNT
                    ? `${MAX_DISPLAYED_UNREAD_COUNT}+`
                    : unreadOpenThreadCount}
                </Badge>
              )
            }
          />
        );

        if (mode !== NAVIGATION_DRAWER_TABS.NAVIGATION_MENU) {
          return modeButton;
        }

        return [
          modeButton,
          ...navigationMenuTabs.map((tab) => (
            <MainNavigationDrawerModeButton
              key={tab.id}
              Icon={getIcon(tab.icon ?? NAVIGATION_MENU_TAB_ICON_DEFAULT)}
              label={tab.name ?? ''}
              isActive={activeNavigationMenuTab?.id === tab.id}
              isExpanded={isExpanded}
              isDisabled={isLayoutCustomizationModeEnabled}
              tooltip={
                isLayoutCustomizationModeEnabled
                  ? t`Finish editing the layout to open this tab`
                  : (tab.name ?? '')
              }
              shouldShowTooltip={shouldShowTooltips}
              onClick={() => switchToNavigationMenuTab(tab.id)}
            />
          )),
        ];
      })}
    </StyledSwitcher>
  );
};
