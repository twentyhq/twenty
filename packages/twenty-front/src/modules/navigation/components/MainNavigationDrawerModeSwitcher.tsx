import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { useAgentChatOpenThreadsSummary } from '@/ai/hooks/useAgentChatOpenThreadsSummary';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { NAVIGATION_MENU_TAB_MAX_COUNT } from '@/navigation-menu-item/common/constants/NavigationMenuTabMaxCount';
import { isNavigationMenuItemAgentsSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemAgentsSection';
import { isNavigationMenuItemAiChatSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemAiChatSection';
import { useActiveNavigationMenuTab } from '@/navigation-menu-item/display/hooks/useActiveNavigationMenuTab';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useWorkspaceNavigationMenuTabs } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuTabs';
import { MainNavigationDrawerAddTabButton } from '@/navigation/components/MainNavigationDrawerAddTabButton';
import { MainNavigationDrawerCustomTab } from '@/navigation/components/MainNavigationDrawerCustomTab';
import { MainNavigationDrawerEditButton } from '@/navigation/components/MainNavigationDrawerEditButton';
import { MainNavigationDrawerModeButton } from '@/navigation/components/MainNavigationDrawerModeButton';
import { useActiveNavigationDrawerMode } from '@/navigation/hooks/useActiveNavigationDrawerMode';
import {
  type NavigationDrawerMode,
  useNavigationDrawerModes,
} from '@/navigation/hooks/useNavigationDrawerModes';
import { useSwitchNavigationDrawerMode } from '@/navigation/hooks/useSwitchNavigationDrawerMode';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
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

const StyledTrailingActions = styled.div`
  display: flex;
  margin-left: auto;
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
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const { switchNavigationDrawerMode, switchToNavigationMenuTab } =
    useSwitchNavigationDrawerMode();
  const { hasUnreadOpenThread } = useAgentChatOpenThreadsSummary();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );

  const getDisabledModeTooltip = () =>
    isAiChatInboxEnabled
      ? t`Finish editing the layout to open Inbox`
      : t`Finish editing the layout to open AI`;

  if (modes.length === 0) {
    return null;
  }

  const shouldShowTooltips = !isExpanded && !isMobile;
  const aiChatSections = workspaceNavigationMenuItems.filter(
    isNavigationMenuItemAiChatSection,
  );
  const hasAiChatSections = aiChatSections.length > 0;
  const hasUnreadInbox = isAiChatInboxEnabled && hasUnreadOpenThread;
  const triageSectionParentIds = new Set(
    aiChatSections
      .filter(
        (section) => section.type === NavigationMenuItemType.AI_CHAT_TRIAGE,
      )
      .map((section) => section.folderId ?? null),
  );
  const isTriageUnread = (parentId: string | null) =>
    hasUnreadInbox && triageSectionParentIds.has(parentId);
  const hasOnlyAiSections = (tabId: string) => {
    const children = workspaceNavigationMenuItems.filter(
      (item) => item.folderId === tabId,
    );

    return (
      children.length > 0 &&
      children.every(
        (child) =>
          isNavigationMenuItemAiChatSection(child) ||
          isNavigationMenuItemAgentsSection(child),
      )
    );
  };

  const isHomeActive =
    !isDefined(activeNavigationMenuTab) &&
    activeNavigationDrawerMode === NAVIGATION_DRAWER_TABS.NAVIGATION_MENU;

  const renderMode = ({ Icon, label, mode }: NavigationDrawerMode) => {
    const isHome = mode === NAVIGATION_DRAWER_TABS.NAVIGATION_MENU;
    const isActive = isHome
      ? isHomeActive
      : mode === activeNavigationDrawerMode;
    // Inside the inbox, its Open item already shows what is unread
    const isUnread =
      !isActive &&
      (isHome
        ? isTriageUnread(null)
        : mode === NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY && hasUnreadInbox);
    const isDisabled = !isHome && isLayoutCustomizationModeEnabled;

    return (
      <MainNavigationDrawerModeButton
        key={mode}
        Icon={Icon}
        label={label}
        ariaLabel={isUnread ? t`${label}, unread` : label}
        tooltip={isDisabled ? getDisabledModeTooltip() : label}
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
  const visibleTabs = navigationMenuTabs.filter(
    (tab) =>
      hasAiPermission ||
      isLayoutCustomizationModeEnabled ||
      !hasOnlyAiSections(tab.id),
  );
  const canAddTab =
    isLayoutCustomizationModeEnabled &&
    !isMobile &&
    leadingModes.length + navigationMenuTabs.length <
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

          return (
            <MainNavigationDrawerCustomTab
              key={tab.id}
              tab={tab}
              isActive={isActive}
              isExpanded={isExpanded}
              isTooltipDisabled={!shouldShowTooltips}
              isUnread={!isActive && isTriageUnread(tab.id)}
            />
          );
        })}
      {canAddTab && (
        <MainNavigationDrawerAddTabButton
          isExpanded={isExpanded}
          isTooltipDisabled={!shouldShowTooltips}
        />
      )}
      {isExpanded && (
        <StyledTrailingActions>
          <MainNavigationDrawerEditButton
            isExpanded={isExpanded}
            isTooltipDisabled={!shouldShowTooltips}
          />
        </StyledTrailingActions>
      )}
    </StyledSwitcher>
  );
};
