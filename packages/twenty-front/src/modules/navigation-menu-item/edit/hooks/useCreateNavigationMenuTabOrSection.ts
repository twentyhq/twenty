import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { v4 } from 'uuid';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { AI_CHAT_INBOX_RECENT_THREADS_MAX_COUNT } from '@/ai/constants/AiChatInboxRecentThreadsMaxCount';
import { NAVIGATION_MENU_TAB_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/NavigationMenuTabIconDefault';
import { currentNavigationMenuTabIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuTabIdState';
import { navigationMenuItemIdToRenameState } from '@/navigation-menu-item/common/states/navigationMenuItemIdToRenameState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/common/states/navigationMenuItemsDraftState';
import { buildOptimisticNavigationMenuItem } from '@/navigation-menu-item/common/utils/buildOptimisticNavigationMenuItem';
import { isNavigationMenuItemAnySection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemAnySection';
import { isNavigationMenuItemTab } from '@/navigation-menu-item/common/utils/isNavigationMenuItemTab';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useCreateNavigationMenuTabOrSection = () => {
  const { t } = useLingui();
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
  const setNavigationMenuItemsDraft = useSetAtomState(
    navigationMenuItemsDraftState,
  );
  const setCurrentNavigationMenuTabId = useSetAtomState(
    currentNavigationMenuTabIdState,
  );
  const setNavigationMenuItemIdToRename = useSetAtomState(
    navigationMenuItemIdToRenameState,
  );
  const setNavigationDrawerActiveTab = useSetAtomState(
    navigationDrawerActiveTabState,
  );

  const getNextPosition = (
    isSameKind: (item: NavigationMenuItem) => boolean,
    parentId: string | null,
  ) =>
    Math.max(
      -1,
      ...workspaceNavigationMenuItems
        .filter(
          (item) => isSameKind(item) && (item.folderId ?? null) === parentId,
        )
        .map((item) => item.position),
    ) + 1;

  const addToDraft = (newItem: NavigationMenuItem) =>
    setNavigationMenuItemsDraft((draft) => [
      ...(draft ?? workspaceNavigationMenuItems),
      newItem,
    ]);

  const createTab = () => {
    const tab = buildOptimisticNavigationMenuItem({
      id: v4(),
      type: NavigationMenuItemType.TAB,
      name: t`New tab`,
      icon: NAVIGATION_MENU_TAB_ICON_DEFAULT,
      position: getNextPosition(isNavigationMenuItemTab, null),
    });

    addToDraft(tab);

    setNavigationDrawerActiveTab(NAVIGATION_DRAWER_TABS.NAVIGATION_MENU);
    setCurrentNavigationMenuTabId(tab.id);
    setNavigationMenuItemIdToRename(tab.id);
  };

  const createAiSection = ({
    parentId,
    type,
  }: {
    parentId: string | null;
    type: NavigationMenuItemType;
  }) =>
    addToDraft(
      buildOptimisticNavigationMenuItem({
        id: v4(),
        type,
        folderId: parentId ?? undefined,
        position: getNextPosition(isNavigationMenuItemAnySection, parentId),
        visibleItemLimit:
          type === NavigationMenuItemType.AI_CHAT_RECENTS
            ? AI_CHAT_INBOX_RECENT_THREADS_MAX_COUNT
            : undefined,
      }),
    );

  const createSection = (parentId: string | null) => {
    const section = buildOptimisticNavigationMenuItem({
      id: v4(),
      type: NavigationMenuItemType.SECTION,
      name: t`New section`,
      folderId: parentId ?? undefined,
      position: getNextPosition(isNavigationMenuItemAnySection, parentId),
    });

    addToDraft(section);
    setNavigationMenuItemIdToRename(section.id);
  };

  return { createTab, createSection, createAiSection };
};
