import { NavigationMenuItemType } from 'twenty-shared/types';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Badge } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';
import { isDefined } from 'twenty-shared/utils';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useActiveNavigationMenuTab } from '@/navigation-menu-item/display/hooks/useActiveNavigationMenuTab';
import { useGetNavigationMenuTabAttentionLabel } from '@/navigation-menu-item/display/hooks/useGetNavigationMenuTabAttentionLabel';
import { useNavigationMenuChatAttention } from '@/navigation-menu-item/display/hooks/useNavigationMenuChatAttention';
import { useWorkspaceNavigationMenuContainers } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuContainers';
import { NAVIGATION_MENU_TAB_MAX_COUNT } from '@/navigation-menu-item/common/constants/NavigationMenuTabMaxCount';
import { MainNavigationDrawerAddTabButton } from '@/navigation/components/MainNavigationDrawerAddTabButton';
import { MainNavigationDrawerSidebarTab } from '@/navigation/components/MainNavigationDrawerSidebarTab';
import { MainNavigationDrawerTab } from '@/navigation/components/MainNavigationDrawerTab';
import { StyledNavigationDrawerAttentionDot } from '@/navigation/components/StyledNavigationDrawerAttentionDot';
import { MainNavigationDrawerTabDropTarget } from '@/navigation/components/MainNavigationDrawerTabDropTarget';
import { useActiveNavigationDrawerTab } from '@/navigation/hooks/useActiveNavigationDrawerTab';
import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { useNavigationDrawerTabs } from '@/navigation/hooks/useNavigationDrawerTabs';
import { useSwitchNavigationDrawerTab } from '@/navigation/hooks/useSwitchNavigationDrawerTab';
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
const StyledSwitcher = styled.div<{
  isExpanded: boolean;
  isPinnedToBottom: boolean;
}>`
  align-items: ${({ isExpanded }) => (isExpanded ? 'center' : 'flex-start')};
  border-bottom: ${({ isExpanded, isPinnedToBottom }) =>
    isExpanded && !isPinnedToBottom
      ? `1px solid ${themeCssVariables.border.color.light}`
      : 'none'};
  box-sizing: border-box;
  display: flex;
  flex-direction: ${({ isExpanded }) => (isExpanded ? 'row' : 'column')};
  gap: ${({ isExpanded }) =>
    isExpanded
      ? themeCssVariables.spacing['0.5']
      : themeCssVariables.betweenSiblingsGap};
  height: ${({ isExpanded, isPinnedToBottom }) =>
    isExpanded && !isPinnedToBottom ? themeCssVariables.spacing[10] : 'auto'};
  min-width: 0;
`;

const StyledUnreadBadge = styled.span`
  pointer-events: none;
  position: absolute;
  right: calc(-1 * ${themeCssVariables.spacing['1.5']});
  top: calc(-1 * ${themeCssVariables.spacing['1.5']});
`;

type MainNavigationDrawerTabSwitcherProps = {
  isPinnedToBottom?: boolean;
};

export const MainNavigationDrawerTabSwitcher = ({
  isPinnedToBottom = false,
}: MainNavigationDrawerTabSwitcherProps) => {
  const { t } = useLingui();

  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const isMobile = useIsMobile();
  const isExpanded = useIsNavigationDrawerContentExpanded();
  const drawerTabs = useNavigationDrawerTabs();
  const activeNavigationDrawerTab = useActiveNavigationDrawerTab();
  const { switchNavigationDrawerTab } = useSwitchNavigationDrawerTab();
  const navigationMenuTabs = useWorkspaceNavigationMenuContainers({
    type: NavigationMenuItemType.TAB,
    containerId: null,
  });
  const tabCountIncludingHome = navigationMenuTabs.length + 1;
  const activeNavigationMenuTab = useActiveNavigationMenuTab();
  const { getTabChatAttention, unreadOpenThreadCount } =
    useNavigationMenuChatAttention();
  const getNavigationMenuTabAttentionLabel =
    useGetNavigationMenuTabAttentionLabel();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );

  const getDisabledDrawerTabTooltip = (
    drawerTab: NavigationDrawerActiveTab,
  ) => {
    if (drawerTab === NAVIGATION_DRAWER_TABS.SETTINGS) {
      return t`Finish editing the layout to open Settings`;
    }

    return isAiChatInboxEnabled
      ? t`Finish editing the layout to open Inbox`
      : t`Finish editing the layout to open AI`;
  };

  if (drawerTabs.length === 0) {
    return null;
  }

  const shouldShowTooltips = !isExpanded && !isMobile;
  const isTabContentShown = (isActive: boolean) => isActive && isExpanded;

  return (
    <StyledSwitcher
      isExpanded={isExpanded}
      isPinnedToBottom={isPinnedToBottom}
      role="group"
      aria-label={t`Navigation modes`}
    >
      {drawerTabs.map(({ Icon, label, tab: drawerTab }) => {
        const isActive =
          drawerTab === activeNavigationDrawerTab &&
          !(
            drawerTab === NAVIGATION_DRAWER_TABS.NAVIGATION_MENU &&
            isDefined(activeNavigationMenuTab)
          );
        // Inside the inbox, its Open item already shows what is unread
        const isUnread =
          isAiChatInboxEnabled &&
          drawerTab === NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY &&
          unreadOpenThreadCount > 0 &&
          !isActive;
        const isDisabled =
          drawerTab !== NAVIGATION_DRAWER_TABS.NAVIGATION_MENU &&
          isLayoutCustomizationModeEnabled;
        const isLabelHidden =
          isPinnedToBottom &&
          drawerTab === NAVIGATION_DRAWER_TABS.NAVIGATION_MENU;
        const homeChatAttention =
          drawerTab === NAVIGATION_DRAWER_TABS.NAVIGATION_MENU &&
          !isTabContentShown(isActive)
            ? getTabChatAttention(null)
            : null;

        const drawerTabButton = (
          <MainNavigationDrawerTab
            key={drawerTab}
            Icon={Icon}
            label={label}
            isActive={isActive}
            isExpanded={isExpanded}
            isDisabled={isDisabled}
            tooltip={
              isDisabled ? getDisabledDrawerTabTooltip(drawerTab) : label
            }
            shouldShowTooltip={shouldShowTooltips || isLabelHidden}
            isLabelHidden={isLabelHidden}
            ariaLabel={
              isUnread
                ? t`${label}, ${unreadOpenThreadCount} unread`
                : getNavigationMenuTabAttentionLabel({
                    tabName: label,
                    attention: homeChatAttention,
                  })
            }
            onClick={() => switchNavigationDrawerTab(drawerTab)}
            iconAccessory={
              <>
                {isDefined(homeChatAttention) && (
                  <StyledNavigationDrawerAttentionDot
                    data-attention={homeChatAttention}
                    aria-hidden="true"
                  />
                )}
                {isUnread && (
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
                )}
              </>
            }
          />
        );

        if (drawerTab !== NAVIGATION_DRAWER_TABS.NAVIGATION_MENU) {
          return drawerTabButton;
        }

        return [
          <MainNavigationDrawerTabDropTarget key={drawerTab} tabId={null}>
            {drawerTabButton}
          </MainNavigationDrawerTabDropTarget>,
          ...navigationMenuTabs.map((tab) => {
            const isTabActive = activeNavigationMenuTab?.id === tab.id;

            return (
              <MainNavigationDrawerTabDropTarget key={tab.id} tabId={tab.id}>
                <MainNavigationDrawerSidebarTab
                  tab={tab}
                  isActive={isTabActive}
                  isExpanded={isExpanded}
                  shouldShowTooltip={shouldShowTooltips}
                  attention={
                    isTabContentShown(isTabActive)
                      ? null
                      : getTabChatAttention(tab.id)
                  }
                />
              </MainNavigationDrawerTabDropTarget>
            );
          }),
          ...(isLayoutCustomizationModeEnabled &&
          tabCountIncludingHome < NAVIGATION_MENU_TAB_MAX_COUNT
            ? [
                <MainNavigationDrawerAddTabButton
                  key="add-tab"
                  isExpanded={isExpanded}
                  shouldShowTooltip={shouldShowTooltips}
                />,
              ]
            : []),
        ];
      })}
    </StyledSwitcher>
  );
};
