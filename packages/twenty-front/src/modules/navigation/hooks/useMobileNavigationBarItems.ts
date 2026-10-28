import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { NAVIGATION_MENU_TAB_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/NavigationMenuTabIconDefault';
import { currentNavigationMenuTabIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuTabIdState';
import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { useNavigationDrawerAttention } from '@/navigation/hooks/useNavigationDrawerAttention';
import { useVisibleNavigationMenuTabs } from '@/navigation/hooks/useVisibleNavigationMenuTabs';
import { type NavigationDrawerAttention } from '@/navigation/types/NavigationDrawerAttention';
import { currentMobileNavigationDrawerState } from '@/navigation/states/currentMobileNavigationDrawerState';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useOpenRecordsSearchPageInSidePanel } from '@/side-panel/hooks/useOpenRecordsSearchPageInSidePanel';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useLingui } from '@lingui/react/macro';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type IconComponent,
  IconHome,
  IconMessageCirclePlus,
  IconSearch,
  useIcons,
} from 'twenty-ui/icon';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

type MobileNavigationBarItem = {
  name: string;
  kind: 'tab' | 'action';
  label: string;
  Icon: IconComponent;
  attention?: NavigationDrawerAttention | null;
  onClick: () => void;
};

export const useMobileNavigationBarItems = (): {
  items: MobileNavigationBarItem[];
  activeItemName: string;
} => {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { openRecordsSearchPage } = useOpenRecordsSearchPageInSidePanel();
  const { switchToNewChat } = useSwitchToNewAiChat();
  const isSettingsPage = useIsSettingsPage();
  const isSettingsDrawer = useIsSettingsDrawer();
  const { alphaSortedActiveNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );
  const visibleNavigationMenuTabs = useVisibleNavigationMenuTabs();
  const currentNavigationMenuTabId = useAtomStateValue(
    currentNavigationMenuTabIdState,
  );
  const setCurrentNavigationMenuTabId = useSetAtomState(
    currentNavigationMenuTabIdState,
  );
  const setNavigationDrawerActiveTab = useSetAtomState(
    navigationDrawerActiveTabState,
  );
  const { getTabAttention } = useNavigationDrawerAttention();
  const { getIcon } = useIcons();

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

  const navigationMenuTabs = isCustomizableSidebarEnabled
    ? visibleNavigationMenuTabs
    : [];
  const activeNavigationMenuTabId = navigationMenuTabs.some(
    (tab) => tab.id === currentNavigationMenuTabId,
  )
    ? currentNavigationMenuTabId
    : null;
  const activeItemName =
    pathname === AppPath.Home ? (activeNavigationMenuTabId ?? 'home') : '';

  const openNavigationMenuTab = (tabId: string | null) => {
    closeSidePanelMenu();
    closeSettingsDrawer();
    setCurrentNavigationMenuTabId(tabId);
    setNavigationDrawerActiveTab(NAVIGATION_DRAWER_TABS.NAVIGATION_MENU);
    // Replace like desktop so going back doesn't land in the settings just left.
    navigate(AppPath.Home, { replace: isSettingsDrawer });
  };

  const getTabItemAttention = ({
    name,
    tabId,
  }: {
    name: string;
    tabId: string | null;
  }) => (activeItemName === name ? null : getTabAttention(tabId));

  return {
    activeItemName,
    items: [
      {
        name: 'home',
        kind: 'tab',
        label: t`Home`,
        Icon: IconHome,
        attention: getTabItemAttention({ name: 'home', tabId: null }),
        onClick: () => openNavigationMenuTab(null),
      },
      ...navigationMenuTabs.map((tab): MobileNavigationBarItem => ({
        name: tab.id,
        kind: 'tab',
        label: tab.name ?? t`Tab`,
        Icon: getIcon(tab.icon ?? NAVIGATION_MENU_TAB_ICON_DEFAULT),
        attention: getTabItemAttention({ name: tab.id, tabId: tab.id }),
        onClick: () => openNavigationMenuTab(tab.id),
      })),
      {
        name: 'search',
        kind: 'action',
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
              name: 'newAiChat',
              kind: 'action' as const,
              label: t`New AI chat`,
              Icon: IconMessageCirclePlus,
              onClick: () => {
                closeSidePanelMenu();
                closeSettingsDrawer();
                switchToNewChat();
              },
            },
          ]
        : []),
    ],
  };
};
