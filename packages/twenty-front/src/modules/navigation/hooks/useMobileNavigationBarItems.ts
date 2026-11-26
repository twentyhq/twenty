import { useSwitchToNewAiChatInInboxChannel } from '@/inbox/hooks/useSwitchToNewAiChatInInboxChannel';
import { NAVIGATION_MENU_TAB_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/NavigationMenuTabIconDefault';
import { currentNavigationMenuItemFolderIdFamilyState } from '@/navigation-menu-item/common/states/currentNavigationMenuItemFolderIdFamilyState';
import { currentNavigationMenuTabIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuTabIdState';
import { type InboxChatAttention } from '@/inbox/types/InboxChatAttention';
import { getNavigationMenuTabFolderKey } from '@/navigation-menu-item/common/utils/getNavigationMenuTabFolderKey';
import { useActiveNavigationMenuTab } from '@/navigation-menu-item/display/hooks/useActiveNavigationMenuTab';
import { useHasAiChatSectionInSidebar } from '@/navigation-menu-item/display/hooks/useHasAiChatSectionInSidebar';
import { useGetNavigationMenuTabLabel } from '@/navigation-menu-item/display/hooks/useGetNavigationMenuTabLabel';
import { useGetNavigationMenuTabAttentionLabel } from '@/navigation-menu-item/display/hooks/useGetNavigationMenuTabAttentionLabel';
import { useNavigationMenuChatAttention } from '@/navigation-menu-item/display/hooks/useNavigationMenuChatAttention';
import { useWorkspaceNavigationMenuContainers } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuContainers';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { currentMobileNavigationDrawerState } from '@/navigation/states/currentMobileNavigationDrawerState';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useOpenRecordsSearchPageInSidePanel } from '@/side-panel/hooks/useOpenRecordsSearchPageInSidePanel';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppPath, NavigationMenuItemType } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import {
  type IconComponent,
  IconHome,
  IconInbox,
  IconMessageCirclePlus,
  IconSearch,
} from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { isNavigationDrawerTabShown } from '@/navigation/utils/isNavigationDrawerTabShown';
import { isInboxPath } from '~/utils/isInboxPath';

type MobileNavigationBarItemName =
  | 'home'
  | 'inbox'
  | 'search'
  | 'newAiChat'
  | `tab-${string}`;

type MobileNavigationBarItem = {
  name: MobileNavigationBarItemName;
  label: string;
  Icon: IconComponent;
  onClick: () => void;
  attention?: InboxChatAttention | null;
  hasDividerAfter?: boolean;
};

export const useMobileNavigationBarItems = (): {
  items: MobileNavigationBarItem[];
  activeItemName: MobileNavigationBarItemName | '';
} => {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { openRecordsSearchPage } = useOpenRecordsSearchPageInSidePanel();
  const { switchToNewAiChat } = useSwitchToNewAiChatInInboxChannel();
  const isSettingsPage = useIsSettingsPage();
  const isSettingsDrawer = useIsSettingsDrawer();
  const { alphaSortedActiveNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );
  const hasAiChatSectionInSidebar = useHasAiChatSectionInSidebar();
  const { getIcon } = useIcons();
  const navigationMenuTabs = useWorkspaceNavigationMenuContainers({
    type: NavigationMenuItemType.TAB,
    containerId: null,
  });
  const activeNavigationMenuTab = useActiveNavigationMenuTab();
  const { getTabChatAttention, unreadOpenThreadCount } =
    useNavigationMenuChatAttention();
  const getNavigationMenuTabAttentionLabel =
    useGetNavigationMenuTabAttentionLabel();
  const getNavigationMenuTabLabel = useGetNavigationMenuTabLabel();
  const setCurrentNavigationMenuTabId = useSetAtomState(
    currentNavigationMenuTabIdState,
  );
  const setNavigationDrawerActiveTab = useSetAtomState(
    navigationDrawerActiveTabState,
  );
  const store = useStore();

  const setContextStoreCurrentObjectMetadataItemId = useSetAtomComponentState(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );
  const setCurrentMobileNavigationDrawer = useSetAtomState(
    currentMobileNavigationDrawerState,
  );
  const setIsNavigationDrawerExpanded = useSetAtomState(
    isNavigationDrawerExpandedState,
  );

  // Expansion state is shared with the desktop drawer, so a tap outside settings must not collapse it.
  const closeSettingsDrawer = () => {
    if (!isSettingsDrawer) {
      return;
    }

    setCurrentMobileNavigationDrawer('main');
    setIsNavigationDrawerExpanded(false);
  };

  // Replace like desktop so going back doesn't land in the settings just left.
  const openHomePageOnTab = (tabId: string | null) => {
    closeSidePanelMenu();
    closeSettingsDrawer();

    const isReopeningCurrentTab =
      pathname === AppPath.Home &&
      store.get(navigationDrawerActiveTabState.atom) ===
        NAVIGATION_DRAWER_TABS.NAVIGATION_MENU &&
      store.get(currentNavigationMenuTabIdState.atom) === tabId;

    setNavigationDrawerActiveTab(NAVIGATION_DRAWER_TABS.NAVIGATION_MENU);
    setCurrentNavigationMenuTabId(tabId);

    if (isReopeningCurrentTab || !isCustomizableSidebarEnabled) {
      store.set(
        currentNavigationMenuItemFolderIdFamilyState.atomFamily(
          getNavigationMenuTabFolderKey(tabId),
        ),
        null,
      );
    }

    navigate(AppPath.Home, { replace: isSettingsDrawer });
  };

  const homeChatAttention = getTabChatAttention(null);
  const isOnInboxPage = isInboxPath(pathname);
  const inboxAttention: InboxChatAttention | null =
    unreadOpenThreadCount > 0 && !isOnInboxPage ? 'unread' : null;

  const openInbox = () => {
    closeSidePanelMenu();
    closeSettingsDrawer();
    navigate(getAppPath(AppPath.AiChatInbox, { threadId: null }), {
      replace: isSettingsDrawer,
    });
  };

  const getActiveItemName = (): MobileNavigationBarItemName | '' => {
    if (isOnInboxPage) {
      return 'inbox';
    }

    if (pathname !== AppPath.Home) {
      return '';
    }

    return isDefined(activeNavigationMenuTab)
      ? `tab-${activeNavigationMenuTab.id}`
      : 'home';
  };

  return {
    activeItemName: getActiveItemName(),
    items: [
      {
        name: 'home',
        label: getNavigationMenuTabAttentionLabel({
          tabName: t`Home`,
          attention: homeChatAttention,
        }),
        Icon: IconHome,
        onClick: () => openHomePageOnTab(null),
        attention: homeChatAttention,
      },
      ...(isAiChatInboxEnabled &&
      isNavigationDrawerTabShown({
        tab: NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
        hasAiPermission,
        hasAiChatSectionInSidebar,
        isCustomizableSidebarEnabled,
      })
        ? [
            {
              name: 'inbox' as const,
              label: getNavigationMenuTabAttentionLabel({
                tabName: t`Inbox`,
                attention: inboxAttention,
              }),
              Icon: IconInbox,
              onClick: openInbox,
              attention: inboxAttention,
            },
          ]
        : []),
      ...navigationMenuTabs.map((tab, index): MobileNavigationBarItem => {
        const attention = getTabChatAttention(tab.id);

        return {
          name: `tab-${tab.id}`,
          label: getNavigationMenuTabAttentionLabel({
            tabName: getNavigationMenuTabLabel(tab),
            attention,
          }),
          Icon: getIcon(tab.icon ?? NAVIGATION_MENU_TAB_ICON_DEFAULT),
          onClick: () => openHomePageOnTab(tab.id),
          attention,
          hasDividerAfter: index === navigationMenuTabs.length - 1,
        };
      }),
      {
        name: 'search',
        label: t`Search`,
        Icon: IconSearch,
        onClick: () => {
          closeSidePanelMenu();
          closeSettingsDrawer();

          if (isSettingsPage) {
            const firstObjectMetadataItem =
              alphaSortedActiveNonSystemObjectMetadataItems[0];
            if (isDefined(firstObjectMetadataItem)) {
              setContextStoreCurrentObjectMetadataItemId(
                firstObjectMetadataItem.id,
              );
            }
          }

          openRecordsSearchPage();
        },
      },
      ...(hasAiPermission && !isAiChatInboxEnabled
        ? [
            {
              name: 'newAiChat' as const,
              label: t`New AI chat`,
              Icon: IconMessageCirclePlus,
              onClick: () => {
                closeSidePanelMenu();
                closeSettingsDrawer();
                switchToNewAiChat();
              },
            },
          ]
        : []),
    ],
  };
};
