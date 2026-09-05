import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { useNavigationDrawerModes } from '@/navigation/hooks/useNavigationDrawerModes';
import { useSwitchNavigationDrawerMode } from '@/navigation/hooks/useSwitchNavigationDrawerMode';
import { currentMobileNavigationDrawerState } from '@/navigation/states/currentMobileNavigationDrawerState';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useOpenRecordsSearchPageInSidePanel } from '@/side-panel/hooks/useOpenRecordsSearchPageInSidePanel';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import {
  type NavigationDrawerActiveTab,
  NAVIGATION_DRAWER_TABS,
} from '@/ui/navigation/states/navigationDrawerTabs';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLingui } from '@lingui/react/macro';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent, IconSearch } from 'twenty-ui/icon';
import { isAiChatPath } from '~/utils/isAiChatPath';

const SEARCH_ITEM_NAME = 'search';

type MobileNavigationBarItemName =
  | NavigationDrawerActiveTab
  | typeof SEARCH_ITEM_NAME;

type MobileNavigationBarItem = {
  name: MobileNavigationBarItemName;
  label: string;
  Icon: IconComponent;
  onClick: () => void;
};

export const useMobileNavigationBarItems = (): {
  items: MobileNavigationBarItem[];
  activeItemName: MobileNavigationBarItemName;
} => {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { openRecordsSearchPage } = useOpenRecordsSearchPageInSidePanel();
  const isSettingsPage = useIsSettingsPage();
  const isSettingsDrawer = useIsSettingsDrawer();
  const { alphaSortedActiveNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();
  const modes = useNavigationDrawerModes();
  const { switchNavigationDrawerMode } = useSwitchNavigationDrawerMode();

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

  // The expansion state is shared with the desktop drawer, so the guard keeps a
  // tap outside settings from collapsing it there.
  const closeSettingsDrawer = () => {
    if (!isSettingsDrawer) {
      return;
    }

    setCurrentMobileNavigationDrawer('main');
    setIsNavigationDrawerExpanded(false);
  };

  // Desktop leaves the current page in place when it switches back to the
  // navigation menu, because the drawer beside it is the menu. Mobile has no
  // drawer, so the home page is the tab itself.
  const switchToMobileNavigationMenu = () => {
    closeSettingsDrawer();
    setNavigationDrawerActiveTab(NAVIGATION_DRAWER_TABS.NAVIGATION_MENU);
    navigate(AppPath.Home);
  };

  const handleModeClick = (mode: NavigationDrawerActiveTab) => {
    closeSidePanelMenu();

    if (mode === NAVIGATION_DRAWER_TABS.NAVIGATION_MENU) {
      switchToMobileNavigationMenu();
      return;
    }

    if (mode === NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY) {
      closeSettingsDrawer();
    }

    switchNavigationDrawerMode(mode);
  };

  const handleSearchClick = () => {
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
  };

  const searchItem: MobileNavigationBarItem = {
    name: SEARCH_ITEM_NAME,
    label: t`Search`,
    Icon: IconSearch,
    onClick: handleSearchClick,
  };

  // Search is an action rather than a destination, so it sits next to the home
  // tab it used to share the bar with instead of between two tabs.
  const items = modes.flatMap<MobileNavigationBarItem>(
    ({ Icon, label, mode }) => {
      const modeItem: MobileNavigationBarItem = {
        name: mode,
        label,
        Icon,
        onClick: () => handleModeClick(mode),
      };

      return mode === NAVIGATION_DRAWER_TABS.NAVIGATION_MENU
        ? [modeItem, searchItem]
        : [modeItem];
    },
  );

  // The stored tab keeps the chat history listed beside another page on
  // desktop; mobile has no such split, so the route alone says which tab the
  // user is on.
  const activeItemName = isSettingsDrawer
    ? NAVIGATION_DRAWER_TABS.SETTINGS
    : isAiChatPath(pathname)
      ? NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY
      : NAVIGATION_DRAWER_TABS.NAVIGATION_MENU;

  return { items, activeItemName };
};
