import { NAVIGATION_MENU_ITEM_SECTION_DROPPABLE_CONFIG } from '@/navigation-menu-item/common/constants/NavigationMenuItemSectionDroppableConfig';
import type { NavigationMenuItemDroppableTarget } from '@/navigation-menu-item/common/types/NavigationMenuItemDroppableTarget';
import type { NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';
import { isNavigationMenuItemTabOrSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemTabOrSection';
import type { NavigationMenuItem } from '~/generated-metadata/graphql';

export const resolveNavigationMenuItemDroppableId = ({
  droppableId,
  navigationMenuItemSection,
  getNavigationMenuItemById,
}: {
  droppableId: string;
  navigationMenuItemSection: NavigationMenuItemSection;
  getNavigationMenuItemById: (
    id: string,
  ) => Pick<NavigationMenuItem, 'type'> | undefined;
}): NavigationMenuItemDroppableTarget | null => {
  const { orphanDroppableId, folderHeaderPrefix, listPrefix } =
    NAVIGATION_MENU_ITEM_SECTION_DROPPABLE_CONFIG[navigationMenuItemSection];

  if (droppableId === orphanDroppableId) {
    return { kind: 'root', parentId: null };
  }

  if (droppableId.startsWith(folderHeaderPrefix)) {
    return {
      kind: 'folderHeader',
      parentId: droppableId.slice(folderHeaderPrefix.length) || null,
    };
  }

  if (!droppableId.startsWith(listPrefix)) {
    return null;
  }

  const parentId = droppableId.slice(listPrefix.length) || null;
  const parent =
    parentId === null ? undefined : getNavigationMenuItemById(parentId);

  return {
    kind:
      parent !== undefined && isNavigationMenuItemTabOrSection(parent)
        ? 'tabOrSectionList'
        : 'folder',
    parentId,
  };
};
