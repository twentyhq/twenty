import { isDefined } from 'twenty-shared/utils';

import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/common/constants/NavigationMenuItemDroppableIds';
import type { NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';

export const canNavigationMenuItemBeDroppedIn = ({
  navigationMenuItemSection,
  droppableId,
}: {
  navigationMenuItemSection: NavigationMenuItemSection;
  droppableId: string | null | undefined;
}): boolean => {
  if (!isDefined(droppableId)) {
    return false;
  }

  const prefix =
    navigationMenuItemSection === 'workspace'
      ? NavigationMenuItemDroppableIds.WORKSPACE_DROPPABLE_PREFIX
      : NavigationMenuItemDroppableIds.FAVORITE_DROPPABLE_PREFIX;

  return droppableId.startsWith(prefix);
};
