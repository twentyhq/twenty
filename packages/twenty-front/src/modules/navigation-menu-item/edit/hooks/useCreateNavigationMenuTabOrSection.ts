import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { v4 } from 'uuid';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_SETTINGS_LINK } from '@/navigation-menu-item/common/constants/NavigationMenuItemDefaultColorSettingsLink';
import { NAVIGATION_MENU_TAB_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/NavigationMenuTabIconDefault';
import { currentNavigationMenuTabIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuTabIdState';
import { navigationMenuItemIdToRenameState } from '@/navigation-menu-item/common/states/navigationMenuItemIdToRenameState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/common/states/navigationMenuItemsDraftState';
import { buildOptimisticNavigationMenuItem } from '@/navigation-menu-item/common/utils/buildOptimisticNavigationMenuItem';
import { isNavigationMenuItemAnySection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemAnySection';
import { isNavigationMenuItemTab } from '@/navigation-menu-item/common/utils/isNavigationMenuItemTab';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { DEVELOPER_TOOLS_NAVIGATION_MENU_ITEMS } from '@/navigation-menu-item/edit/constants/DeveloperToolsNavigationMenuItems';
import { type NavigationMenuItemContainerTemplate } from '@/navigation-menu-item/edit/types/NavigationMenuItemContainerTemplate';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const INBOX_SECTION_TYPES = [
  NavigationMenuItemType.AI_CHAT_TRIAGE,
  NavigationMenuItemType.AI_CHAT_FAVORITES,
  NavigationMenuItemType.AI_CHAT_RECENTS,
];

export const useCreateNavigationMenuTabOrSection = () => {
  const { t, i18n } = useLingui();
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

  const buildTemplateChildren = (
    template: NavigationMenuItemContainerTemplate,
    parentId: string,
  ): NavigationMenuItem[] => {
    switch (template) {
      case 'developer-tools':
        return DEVELOPER_TOOLS_NAVIGATION_MENU_ITEMS.map((tool, index) =>
          buildOptimisticNavigationMenuItem({
            id: v4(),
            type: NavigationMenuItemType.LINK,
            name: i18n._(tool.label),
            link: tool.link,
            icon: tool.iconName,
            color: DEFAULT_NAVIGATION_MENU_ITEM_COLOR_SETTINGS_LINK,
            folderId: parentId,
            position: index,
          }),
        );
      case 'inbox':
        return INBOX_SECTION_TYPES.map((type, index) =>
          buildOptimisticNavigationMenuItem({
            id: v4(),
            type,
            folderId: parentId,
            position: index,
          }),
        );
      default:
        return [];
    }
  };

  const addToDraft = (newItems: NavigationMenuItem[]) =>
    setNavigationMenuItemsDraft((draft) => [
      ...(draft ?? workspaceNavigationMenuItems),
      ...newItems,
    ]);

  const getTabNameAndIcon = (template: NavigationMenuItemContainerTemplate) => {
    switch (template) {
      case 'developer-tools':
        return { name: t`Developers`, icon: 'IconCode' };
      case 'inbox':
        return { name: t`Inbox`, icon: 'IconInbox' };
      default:
        return { name: t`New tab`, icon: NAVIGATION_MENU_TAB_ICON_DEFAULT };
    }
  };

  const createTab = (template: NavigationMenuItemContainerTemplate) => {
    const tab = buildOptimisticNavigationMenuItem({
      id: v4(),
      type: NavigationMenuItemType.TAB,
      ...getTabNameAndIcon(template),
      position: getNextPosition(isNavigationMenuItemTab, null),
    });

    addToDraft([tab, ...buildTemplateChildren(template, tab.id)]);

    if (template === 'inbox') {
      setNavigationDrawerActiveTab(NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY);
      return;
    }

    setNavigationDrawerActiveTab(NAVIGATION_DRAWER_TABS.NAVIGATION_MENU);
    setCurrentNavigationMenuTabId(tab.id);

    if (template === 'blank') {
      setNavigationMenuItemIdToRename(tab.id);
    }
  };

  const createAiChatSection = ({
    parentId,
    type,
  }: {
    parentId: string | null;
    type: NavigationMenuItemType;
  }) =>
    addToDraft([
      buildOptimisticNavigationMenuItem({
        id: v4(),
        type,
        folderId: parentId ?? undefined,
        position: getNextPosition(isNavigationMenuItemAnySection, parentId),
      }),
    ]);

  const createSection = ({
    parentId,
    template,
  }: {
    parentId: string | null;
    template: NavigationMenuItemContainerTemplate;
  }) => {
    const section = buildOptimisticNavigationMenuItem({
      id: v4(),
      type: NavigationMenuItemType.SECTION,
      name: template === 'developer-tools' ? t`Developers` : t`New section`,
      folderId: parentId ?? undefined,
      position: getNextPosition(isNavigationMenuItemAnySection, parentId),
    });

    addToDraft([section, ...buildTemplateChildren(template, section.id)]);

    if (template === 'blank') {
      setNavigationMenuItemIdToRename(section.id);
    }
  };

  return { createTab, createSection, createAiChatSection };
};
