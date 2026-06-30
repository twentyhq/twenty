import { NAVIGATION_MENU_ITEM_SECTION_DROPPABLE_CONFIG } from '@/navigation-menu-item/common/constants/NavigationMenuItemSectionDroppableConfig';
import type { NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';

export const extractFolderIdFromDroppableId = (
  droppableId: string,
  navigationMenuItemSection: NavigationMenuItemSection,
): string | null => {
  const config =
    NAVIGATION_MENU_ITEM_SECTION_DROPPABLE_CONFIG[navigationMenuItemSection];

  if (droppableId === config.orphanDroppableId) {
    return null;
  }

  if (droppableId.startsWith(config.folderHeaderPrefix)) {
    return droppableId.slice(config.folderHeaderPrefix.length) || null;
  }

  if (droppableId.startsWith(config.folderPrefix)) {
    return droppableId.slice(config.folderPrefix.length) || null;
  }

  return null;
};
