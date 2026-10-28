import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { AI_CHAT_INBOX_RECENT_THREADS_MAX_COUNT } from '@/ai/constants/AiChatInboxRecentThreadsMaxCount';
import { NAVIGATION_MENU_TAB_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/NavigationMenuTabIconDefault';
import { currentNavigationMenuTabIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuTabIdState';
import { navigationMenuItemIdToRenameState } from '@/navigation-menu-item/common/states/navigationMenuItemIdToRenameState';
import { type NavigationMenuItemBuiltInSectionType } from '@/navigation-menu-item/common/types/NavigationMenuItemBuiltInSectionType';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useCreateNavigationMenuTabOrSection = () => {
  const { t } = useLingui();
  const { createItem } = useNavigationMenuItemEditController('workspace');
  const setCurrentNavigationMenuTabId = useSetAtomState(
    currentNavigationMenuTabIdState,
  );
  const setNavigationMenuItemIdToRename = useSetAtomState(
    navigationMenuItemIdToRenameState,
  );
  const setNavigationDrawerActiveTab = useSetAtomState(
    navigationDrawerActiveTabState,
  );

  const createTab = () => {
    const tabId = createItem({
      type: NavigationMenuItemType.TAB,
      name: t`New tab`,
      icon: NAVIGATION_MENU_TAB_ICON_DEFAULT,
    });

    setNavigationDrawerActiveTab(NAVIGATION_DRAWER_TABS.NAVIGATION_MENU);
    setCurrentNavigationMenuTabId(tabId);
    setNavigationMenuItemIdToRename(tabId);
  };

  const createBuiltInSection = ({
    parentId,
    type,
  }: {
    parentId: string | null;
    type: NavigationMenuItemBuiltInSectionType;
  }) => {
    createItem(
      {
        type,
        visibleItemLimit:
          type === NavigationMenuItemType.AI_CHAT_RECENTS
            ? AI_CHAT_INBOX_RECENT_THREADS_MAX_COUNT
            : undefined,
      },
      { targetFolderId: parentId },
    );
  };

  const createSection = (parentId: string | null) => {
    const sectionId = createItem(
      { type: NavigationMenuItemType.SECTION, name: t`New section` },
      { targetFolderId: parentId },
    );

    setNavigationMenuItemIdToRename(sectionId);
  };

  return { createTab, createSection, createBuiltInSection };
};
