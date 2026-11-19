import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/common/constants/NavigationMenuItemDroppableIds';
import type { NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';

type SectionDroppableConfig = {
  orphanDroppableId: string;
  folderHeaderPrefix: string;
  listPrefix: string;
};

export const NAVIGATION_MENU_ITEM_SECTION_DROPPABLE_CONFIG: Record<
  NavigationMenuItemSection,
  SectionDroppableConfig
> = {
  favorite: {
    orphanDroppableId:
      NavigationMenuItemDroppableIds.FAVORITE_ORPHAN_NAVIGATION_MENU_ITEMS,
    folderHeaderPrefix:
      NavigationMenuItemDroppableIds.FAVORITE_FOLDER_HEADER_PREFIX,
    listPrefix: NavigationMenuItemDroppableIds.FAVORITE_LIST_PREFIX,
  },
  workspace: {
    orphanDroppableId:
      NavigationMenuItemDroppableIds.WORKSPACE_ORPHAN_NAVIGATION_MENU_ITEMS,
    folderHeaderPrefix:
      NavigationMenuItemDroppableIds.WORKSPACE_FOLDER_HEADER_PREFIX,
    listPrefix: NavigationMenuItemDroppableIds.WORKSPACE_LIST_PREFIX,
  },
};
