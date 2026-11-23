import { useSwitchToNewAiChatInInboxChannel } from '@/inbox/hooks/useSwitchToNewAiChatInInboxChannel';
import { NAVIGATION_MENU_TAB_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/NavigationMenuTabIconDefault';
import { currentNavigationMenuItemFolderIdFamilyState } from '@/navigation-menu-item/common/states/currentNavigationMenuItemFolderIdFamilyState';
import { currentNavigationMenuTabIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuTabIdState';
import { getNavigationMenuTabFolderKey } from '@/navigation-menu-item/common/utils/getNavigationMenuTabFolderKey';
import { useActiveNavigationMenuTab } from '@/navigation-menu-item/display/hooks/useActiveNavigationMenuTab';
import { useNavigationMenuTabIdsWithUnreadChats } from '@/navigation-menu-item/display/hooks/useNavigationMenuTabIdsWithUnreadChats';
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
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppPath, NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type IconComponent,
  IconHome,
  IconMessageCirclePlus,
  IconSearch,
} from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
import { PermissionFlagType } from '~/generated-metadata/graphql';

type MobileNavigationBarItemName =
  | 'home'
  | 'search'
  | 'newAiChat'
  | `tab-${string}`;

type MobileNavigationBarItem = {
  name: MobileNavigationBarItemName;
  label: string;
  Icon: IconComponent;
  onClick: () => void;
  isUnread?: boolean;
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
  const { getIcon } = useIcons();
  const navigationMenuTabs = useWorkspaceNavigationMenuContainers({
    type: NavigationMenuItemType.TAB,
    containerId: null,
  });
  const activeNavigationMenuTab = useActiveNavigationMenuTab();
  const { tabIdsWithUnreadChats, unreadOpenThreadCount } =
    useNavigationMenuTabIdsWithUnreadChats();
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

    if (isReopeningCurrentTab) {
      store.set(
        currentNavigationMenuItemFolderIdFamilyState.atomFamily(
          getNavigationMenuTabFolderKey(tabId),
        ),
        null,
      );
    }

    navigate(AppPath.Home, { replace: isSettingsDrawer });
  };

  const getActiveItemName = (): MobileNavigationBarItemName | '' => {
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
        label: t`Home`,
        Icon: IconHome,
        onClick: () => openHomePageOnTab(null),
      },
      ...navigationMenuTabs.map((tab, index): MobileNavigationBarItem => {
        const isOpenOnHomePage =
          pathname === AppPath.Home && activeNavigationMenuTab?.id === tab.id;
        const isUnread = !isOpenOnHomePage && tabIdsWithUnreadChats.has(tab.id);

        return {
          name: `tab-${tab.id}`,
          label: isUnread
            ? t`${tab.name}, ${unreadOpenThreadCount} unread`
            : tab.name,
          Icon: getIcon(tab.icon ?? NAVIGATION_MENU_TAB_ICON_DEFAULT),
          onClick: () => openHomePageOnTab(tab.id),
          isUnread,
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
      ...(hasAiPermission
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
