import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
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
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLingui } from '@lingui/react/macro';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type IconComponent,
  IconComment,
  IconHome,
  IconMessageCirclePlus,
  IconSearch,
  IconSettings,
} from 'twenty-ui/icon';
import { PermissionFlagType } from '~/generated-metadata/graphql';

// The tab names double as item names so the active tab maps straight onto the
// bar without a lookup.
type MobileNavigationBarItemName =
  | 'home'
  | 'search'
  | 'newAiChat'
  | 'chat'
  | 'settings';

type MobileNavigationBarItem = {
  name: MobileNavigationBarItemName;
  label: string;
  Icon: IconComponent;
  onClick: () => void;
};

// The bar is the primary switcher for wherever it is. Off the home page it
// switches places, on the home page it switches the sections of that page,
// which is why the tabs row it replaces there no longer exists.
export const useMobileNavigationBarItems = (): {
  items: MobileNavigationBarItem[];
  activeItemName: MobileNavigationBarItemName | undefined;
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
  const navigationDrawerActiveTab = useAtomStateValue(
    navigationDrawerActiveTabState,
  );

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
  const setNavigationDrawerActiveTab = useSetAtomState(
    navigationDrawerActiveTabState,
  );

  const isHomePage = pathname === AppPath.Home;

  // Settings is the one drawer left on mobile, and it stays open across
  // navigation, so it would cover whatever the bottom bar goes to. Guarded so a
  // tap outside settings leaves the persisted expansion alone: it is shared with
  // the desktop drawer, which every tap would otherwise collapse.
  const closeSettingsDrawer = () => {
    if (!isSettingsDrawer) {
      return;
    }

    setCurrentMobileNavigationDrawer('main');
    setIsNavigationDrawerExpanded(false);
  };

  const searchItem: MobileNavigationBarItem = {
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
          setContextStoreCurrentObjectMetadataItemId(firstObjectMetadataItem.id);
        }
      }

      openRecordsSearchPage();
    },
  };

  if (isHomePage) {
    return {
      activeItemName: navigationDrawerActiveTab,
      items: [
        {
          name: 'home',
          label: t`Home`,
          Icon: IconHome,
          onClick: () =>
            setNavigationDrawerActiveTab(NAVIGATION_DRAWER_TABS.NAVIGATION_MENU),
        },
        searchItem,
        ...(hasAiPermission
          ? [
              {
                name: 'chat' as const,
                label: t`Chat`,
                Icon: IconComment,
                onClick: () =>
                  setNavigationDrawerActiveTab(
                    NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
                  ),
              },
            ]
          : []),
        {
          name: 'settings',
          label: t`Settings`,
          Icon: IconSettings,
          onClick: () =>
            setNavigationDrawerActiveTab(NAVIGATION_DRAWER_TABS.SETTINGS),
        },
      ],
    };
  }

  return {
    activeItemName: undefined,
    items: [
      {
        name: 'home',
        label: t`Home`,
        Icon: IconHome,
        onClick: () => {
          closeSidePanelMenu();
          closeSettingsDrawer();
          navigate(AppPath.Home);
        },
      },
      searchItem,
      ...(hasAiPermission
        ? [
            {
              name: 'newAiChat' as const,
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
