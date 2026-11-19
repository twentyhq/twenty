import { isDefined } from 'twenty-shared/utils';

import { NAVIGATION_MENU_ITEM_SECTION_DROPPABLE_CONFIG } from '@/navigation-menu-item/common/constants/NavigationMenuItemSectionDroppableConfig';
import type { NavigationMenuItemDroppableTarget } from '@/navigation-menu-item/common/types/NavigationMenuItemDroppableTarget';
import type { NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';

const sliceParentId = (droppableId: string, prefix: string) =>
  droppableId.slice(prefix.length) || null;

export const resolveNavigationMenuItemDroppableId = (
  droppableId: string,
  navigationMenuItemSection: NavigationMenuItemSection,
): NavigationMenuItemDroppableTarget | null => {
  const config =
    NAVIGATION_MENU_ITEM_SECTION_DROPPABLE_CONFIG[navigationMenuItemSection];

  if (droppableId === config.orphanDroppableId) {
    return { kind: 'root', parentId: null };
  }

  if (
    isDefined(config.tabOrSectionListPrefix) &&
    droppableId.startsWith(config.tabOrSectionListPrefix)
  ) {
    return {
      kind: 'tabOrSectionList',
      parentId: sliceParentId(droppableId, config.tabOrSectionListPrefix),
    };
  }

  if (droppableId.startsWith(config.folderHeaderPrefix)) {
    return {
      kind: 'folderHeader',
      parentId: sliceParentId(droppableId, config.folderHeaderPrefix),
    };
  }

  if (droppableId.startsWith(config.folderPrefix)) {
    return {
      kind: 'folder',
      parentId: sliceParentId(droppableId, config.folderPrefix),
    };
  }

  return null;
};
