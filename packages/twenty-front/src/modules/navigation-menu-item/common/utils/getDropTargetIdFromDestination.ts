import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/common/constants/NavigationMenuItemDroppableIds';
import { canNavigationMenuItemBeDroppedIn } from '@/navigation-menu-item/common/utils/canNavigationMenuItemBeDroppedIn';
import type { DropResult } from '@hello-pangea/dnd';

type NavigationMenuItemSection = 'workspace' | 'favorite';

const SECTION_CONFIG: Record<
  NavigationMenuItemSection,
  {
    orphanDroppableId: string;
    folderHeaderPrefix: string;
    folderPrefix: string;
  }
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

export const getDropTargetIdFromDestination = ({
  navigationMenuItemSection,
  destination,
}: {
  navigationMenuItemSection: NavigationMenuItemSection;
  destination: DropResult['destination'];
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

  const config = SECTION_CONFIG[navigationMenuItemSection];
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
