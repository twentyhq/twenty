import { isDefined } from 'twenty-shared/utils';

import { NAVIGATION_MENU_ITEM_SECTION_DROPPABLE_CONFIG } from '@/navigation-menu-item/common/constants/NavigationMenuItemSectionDroppableConfig';
import type { NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';

export const getNavigationMenuItemListDroppableId = ({
  parentId,
  navigationMenuItemSection,
}: {
  parentId: string | null | undefined;
  navigationMenuItemSection: NavigationMenuItemSection;
}): string => {
  const { orphanDroppableId, tabOrSectionListPrefix } =
    NAVIGATION_MENU_ITEM_SECTION_DROPPABLE_CONFIG[navigationMenuItemSection];

  return isDefined(parentId) && isDefined(tabOrSectionListPrefix)
    ? `${tabOrSectionListPrefix}${parentId}`
    : orphanDroppableId;
};
