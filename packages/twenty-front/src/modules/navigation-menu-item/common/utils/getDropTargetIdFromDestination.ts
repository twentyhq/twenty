import { NAVIGATION_MENU_ITEM_SECTION_DROPPABLE_CONFIG } from '@/navigation-menu-item/common/constants/NavigationMenuItemSectionDroppableConfig';
import type { DropDestination } from '@/navigation-menu-item/common/types/navigationMenuItemDndKitDropDestination';
import type { NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';
import { canNavigationMenuItemBeDroppedIn } from '@/navigation-menu-item/common/utils/canNavigationMenuItemBeDroppedIn';

export const getDropTargetIdFromDestination = ({
  navigationMenuItemSection,
  destination,
}: {
  navigationMenuItemSection: NavigationMenuItemSection;
  destination: DropDestination | null;
}): string | null => {
  if (
    !destination ||
    !canNavigationMenuItemBeDroppedIn({
      navigationMenuItemSection,
      droppableId: destination.droppableId,
    })
  ) {
    return null;
  }

  const config =
    NAVIGATION_MENU_ITEM_SECTION_DROPPABLE_CONFIG[navigationMenuItemSection];
  const { droppableId, index } = destination;

  if (droppableId === config.orphanDroppableId) {
    return `${navigationMenuItemSection}-orphan-${index}`;
  }

  if (droppableId.startsWith(config.folderHeaderPrefix)) {
    const folderId = droppableId.slice(config.folderHeaderPrefix.length);
    return `${navigationMenuItemSection}-${folderId}-${index}`;
  }

  if (droppableId.startsWith(config.folderPrefix)) {
    const folderId = droppableId.slice(config.folderPrefix.length);
    return `${navigationMenuItemSection}-${folderId}-${index}`;
  }

  return null;
};
