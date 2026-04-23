import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/common/constants/NavigationMenuItemDroppableIds';
import type { NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';

type SectionDroppableConfig = {
  orphanDroppableId: string;
  folderHeaderPrefix: string;
  folderPrefix: string;
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
    folderPrefix: NavigationMenuItemDroppableIds.FAVORITE_FOLDER_PREFIX,
  },
  workspace: {
    orphanDroppableId:
      NavigationMenuItemDroppableIds.WORKSPACE_ORPHAN_NAVIGATION_MENU_ITEMS,
    folderHeaderPrefix:
      NavigationMenuItemDroppableIds.WORKSPACE_FOLDER_HEADER_PREFIX,
    folderPrefix: NavigationMenuItemDroppableIds.WORKSPACE_FOLDER_PREFIX,
  },
};
