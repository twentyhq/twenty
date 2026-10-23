import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { useAgentChatOpenThreadsSummary } from '@/ai/hooks/useAgentChatOpenThreadsSummary';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { NAVIGATION_MENU_TAB_MAX_COUNT } from '@/navigation-menu-item/common/constants/NavigationMenuTabMaxCount';
import { useActiveNavigationMenuTab } from '@/navigation-menu-item/display/hooks/useActiveNavigationMenuTab';
import { useNavigationMenuAiChatTab } from '@/navigation-menu-item/display/hooks/useNavigationMenuAiChatTab';
import { useWorkspaceNavigationMenuTabs } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuTabs';
import { MainNavigationDrawerAddTabButton } from '@/navigation/components/MainNavigationDrawerAddTabButton';
import { MainNavigationDrawerCustomTab } from '@/navigation/components/MainNavigationDrawerCustomTab';
import { MainNavigationDrawerModeButton } from '@/navigation/components/MainNavigationDrawerModeButton';
import { useActiveNavigationDrawerMode } from '@/navigation/hooks/useActiveNavigationDrawerMode';
import {
  type NavigationDrawerMode,
  useNavigationDrawerModes,
} from '@/navigation/hooks/useNavigationDrawerModes';
import { useSwitchNavigationDrawerMode } from '@/navigation/hooks/useSwitchNavigationDrawerMode';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import {
  type NavigationDrawerActiveTab,
  NAVIGATION_DRAWER_TABS,
} from '@/ui/navigation/states/navigationDrawerTabs';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { useIsMobile } from 'twenty-ui/utilities';

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

export const MainNavigationDrawerModeSwitcher = () => {
  const { t } = useLingui();

  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const isMobile = useIsMobile();
  const isExpanded = useIsNavigationDrawerContentExpanded();
  const modes = useNavigationDrawerModes();
  const activeNavigationDrawerMode = useActiveNavigationDrawerMode();
  const activeNavigationMenuTab = useActiveNavigationMenuTab();
  const navigationMenuTabs = useWorkspaceNavigationMenuTabs();
  const { aiChatTab, hasAiChatSections } = useNavigationMenuAiChatTab();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const { switchNavigationDrawerMode, switchToNavigationMenuTab } =
    useSwitchNavigationDrawerMode();
  const { hasUnreadOpenThread } = useAgentChatOpenThreadsSummary();
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

  const isHomeActive =
    !isDefined(activeNavigationMenuTab) &&
    (activeNavigationDrawerMode === NAVIGATION_DRAWER_TABS.NAVIGATION_MENU ||
      (activeNavigationDrawerMode === NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY &&
        hasAiChatSections));

  const renderMode = ({ Icon, label, mode }: NavigationDrawerMode) => {
    const isHome = mode === NAVIGATION_DRAWER_TABS.NAVIGATION_MENU;
    const isActive = isHome
      ? isHomeActive
      : mode === activeNavigationDrawerMode;
    // Inside the inbox, its Open item already shows what is unread
    const isUnread =
      isAiChatInboxEnabled &&
      mode === NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY &&
      hasUnreadOpenThread &&
      !isActive;
    const isDisabled = !isHome && isLayoutCustomizationModeEnabled;

    return (
      <MainNavigationDrawerModeButton
        key={mode}
        Icon={Icon}
        label={label}
        ariaLabel={isUnread ? t`${label}, unread` : label}
        tooltip={isDisabled ? getDisabledModeTooltip(mode) : label}
        isTooltipDisabled={!shouldShowTooltips && !isDisabled}
        isActive={isActive}
        isExpanded={isExpanded}
        isDisabled={isDisabled}
        isUnread={isUnread}
        onClick={() =>
          isHome
            ? switchToNavigationMenuTab(null)
            : switchNavigationDrawerMode(mode)
        }
      />
    );
  };

  const leadingModes = modes.filter(
    ({ mode }) =>
      mode !== NAVIGATION_DRAWER_TABS.SETTINGS &&
      (mode !== NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY || !hasAiChatSections),
  );
  const settingsMode = modes.find(
    ({ mode }) => mode === NAVIGATION_DRAWER_TABS.SETTINGS,
  );
  const visibleTabs = navigationMenuTabs.filter(
    (tab) =>
      tab.id !== aiChatTab?.id ||
      hasAiPermission ||
      isLayoutCustomizationModeEnabled,
  );
  const canAddTab =
    isLayoutCustomizationModeEnabled &&
    !isMobile &&
    navigationMenuTabs.filter((tab) => tab.id !== aiChatTab?.id).length <
      NAVIGATION_MENU_TAB_MAX_COUNT;

  return (
    <StyledSwitcher
      isExpanded={isExpanded}
      role="group"
      aria-label={t`Navigation modes`}
    >
      {leadingModes.map(renderMode)}
      {!isMobile &&
        visibleTabs.map((tab) => {
          const isActive = activeNavigationMenuTab?.id === tab.id;
          const isAiChatTab = tab.id === aiChatTab?.id;

          return (
            <MainNavigationDrawerCustomTab
              key={tab.id}
              tab={tab}
              isActive={isActive}
              isExpanded={isExpanded}
              isTooltipDisabled={!shouldShowTooltips}
              isAiChatTab={isAiChatTab}
              isUnread={
                isAiChatTab &&
                isAiChatInboxEnabled &&
                hasUnreadOpenThread &&
                !isActive
              }
            />
          );
        })}
      {canAddTab && (
        <MainNavigationDrawerAddTabButton isExpanded={isExpanded} />
      )}
      {isDefined(settingsMode) && renderMode(settingsMode)}
    </StyledSwitcher>
  );
};
