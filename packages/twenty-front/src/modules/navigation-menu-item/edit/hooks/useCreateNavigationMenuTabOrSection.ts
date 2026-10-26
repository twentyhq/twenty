import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import {
  EngineComponentKey,
  type NavigationMenuItem,
} from '~/generated-metadata/graphql';

import { commandMenuItemsSelector } from '@/command-menu-item/states/commandMenuItemsSelector';
import { NAVIGATION_MENU_CONTAINER_ITEMS_SECTION_POSITION } from '@/navigation-menu-item/common/constants/NavigationMenuContainerItemsSectionPosition';

import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_SETTINGS_LINK } from '@/navigation-menu-item/common/constants/NavigationMenuItemDefaultColorSettingsLink';
import { NAVIGATION_MENU_TAB_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/NavigationMenuTabIconDefault';
import { currentNavigationMenuTabIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuTabIdState';
import { navigationMenuItemIdToRenameState } from '@/navigation-menu-item/common/states/navigationMenuItemIdToRenameState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/common/states/navigationMenuItemsDraftState';
import { buildOptimisticNavigationMenuItem } from '@/navigation-menu-item/common/utils/buildOptimisticNavigationMenuItem';
import { isCommandMenuItemPinnableToNavigationMenu } from '@/navigation-menu-item/common/utils/isCommandMenuItemPinnableToNavigationMenu';
import { isNavigationMenuItemAnySection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemAnySection';
import { isNavigationMenuItemTab } from '@/navigation-menu-item/common/utils/isNavigationMenuItemTab';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { DEVELOPER_TOOLS_NAVIGATION_MENU_ITEMS } from '@/navigation-menu-item/edit/constants/DeveloperToolsNavigationMenuItems';
import { type NavigationMenuItemContainerTemplate } from '@/navigation-menu-item/edit/types/NavigationMenuItemContainerTemplate';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const INBOX_SECTION_TYPES = [
  NavigationMenuItemType.AI_CHAT_TRIAGE,
  NavigationMenuItemType.AI_CHAT_FAVORITES,
  NavigationMenuItemType.AI_CHAT_RECENTS,
];

const ACTIONS_SECTION_ENGINE_COMPONENT_KEYS = [
  EngineComponentKey.SEARCH_RECORDS,
  EngineComponentKey.ASK_AI,
  EngineComponentKey.OPEN_SIDE_PANEL,
];

export const useCreateNavigationMenuTabOrSection = () => {
  const { t, i18n } = useLingui();
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
  const commandMenuItems = useAtomStateValue(commandMenuItemsSelector);
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
      case 'actions':
        return ACTIONS_SECTION_ENGINE_COMPONENT_KEYS.map((engineComponentKey) =>
          commandMenuItems.find(
            (commandMenuItem) =>
              commandMenuItem.engineComponentKey === engineComponentKey &&
              isCommandMenuItemPinnableToNavigationMenu(commandMenuItem),
          ),
        )
          .filter(isDefined)
          .map((commandMenuItem, index) =>
            buildOptimisticNavigationMenuItem({
              id: v4(),
              type: NavigationMenuItemType.COMMAND,
              commandMenuItemId: commandMenuItem.id,
              folderId: parentId,
              position: index,
            }),
          );
      default:
        return [];
    }
  };

  const getTopSectionPosition = (parentId: string | null) =>
    Math.min(
      NAVIGATION_MENU_CONTAINER_ITEMS_SECTION_POSITION,
      ...workspaceNavigationMenuItems
        .filter(
          (item) =>
            isNavigationMenuItemAnySection(item) &&
            (item.folderId ?? null) === parentId,
        )
        .map((item) => item.position),
    ) - 1;

  const getSectionName = (template: NavigationMenuItemContainerTemplate) => {
    switch (template) {
      case 'developer-tools':
        return t`Developers`;
      case 'actions':
        return t`Actions`;
      default:
        return t`New section`;
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

    setNavigationDrawerActiveTab(NAVIGATION_DRAWER_TABS.NAVIGATION_MENU);
    setCurrentNavigationMenuTabId(tab.id);

    if (template === 'blank') {
      setNavigationMenuItemIdToRename(tab.id);
    }
  };

  const createAiSection = ({
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
      name: getSectionName(template),
      folderId: parentId ?? undefined,
      position:
        template === 'actions'
          ? getTopSectionPosition(parentId)
          : getNextPosition(isNavigationMenuItemAnySection, parentId),
    });

    addToDraft([section, ...buildTemplateChildren(template, section.id)]);

    if (template === 'blank') {
      setNavigationMenuItemIdToRename(section.id);
    }
  };

  return { createTab, createSection, createAiSection };
};
