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
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { DEVELOPER_TOOLS_NAVIGATION_MENU_ITEMS } from '@/navigation-menu-item/edit/constants/DeveloperToolsNavigationMenuItems';
import { type NavigationMenuItemContainerTemplate } from '@/navigation-menu-item/edit/types/NavigationMenuItemContainerTemplate';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

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

  const getNextPosition = (
    type: NavigationMenuItemType,
    parentId: string | null,
  ) =>
    Math.max(
      -1,
      ...workspaceNavigationMenuItems
        .filter(
          (item) => item.type === type && (item.folderId ?? null) === parentId,
        )
        .map((item) => item.position),
    ) + 1;

  const buildTemplateChildren = (
    template: NavigationMenuItemContainerTemplate,
    parentId: string,
  ): NavigationMenuItem[] =>
    template === 'developer-tools'
      ? DEVELOPER_TOOLS_NAVIGATION_MENU_ITEMS.map((tool, index) =>
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
        )
      : [];

  const addToDraft = (newItems: NavigationMenuItem[]) =>
    setNavigationMenuItemsDraft((draft) => [
      ...(draft ?? workspaceNavigationMenuItems),
      ...newItems,
    ]);

  const createTab = (template: NavigationMenuItemContainerTemplate) => {
    const isDeveloperTools = template === 'developer-tools';
    const tab = buildOptimisticNavigationMenuItem({
      id: v4(),
      type: NavigationMenuItemType.TAB,
      name: isDeveloperTools ? t`Developers` : t`New tab`,
      icon: isDeveloperTools ? 'IconCode' : NAVIGATION_MENU_TAB_ICON_DEFAULT,
      position: getNextPosition(NavigationMenuItemType.TAB, null),
    });

    addToDraft([tab, ...buildTemplateChildren(template, tab.id)]);
    setCurrentNavigationMenuTabId(tab.id);

    if (!isDeveloperTools) {
      setNavigationMenuItemIdToRename(tab.id);
    }
  };

  const createSection = ({
    parentId,
    template,
  }: {
    parentId: string | null;
    template: NavigationMenuItemContainerTemplate;
  }) => {
    const isDeveloperTools = template === 'developer-tools';
    const section = buildOptimisticNavigationMenuItem({
      id: v4(),
      type: NavigationMenuItemType.SECTION,
      name: isDeveloperTools ? t`Developers` : t`New section`,
      folderId: parentId ?? undefined,
      position: getNextPosition(NavigationMenuItemType.SECTION, parentId),
    });

    addToDraft([section, ...buildTemplateChildren(template, section.id)]);

    if (!isDeveloperTools) {
      setNavigationMenuItemIdToRename(section.id);
    }
  };

  return { createTab, createSection };
};
