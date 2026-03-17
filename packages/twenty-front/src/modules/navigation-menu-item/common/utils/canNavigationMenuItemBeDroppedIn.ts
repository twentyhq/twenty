import { isDefined } from 'twenty-shared/utils';

import {
  FAVORITE_NAVIGATION_ITEM_DROPPABLE_PREFIX,
  WORKSPACE_NAVIGATION_ITEM_DROPPABLE_PREFIX,
} from '@/navigation-menu-item/common/constants/NavigationMenuItemDroppableIds';

type NavigationMenuItemSection = 'workspace' | 'favorite';

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
      ? WORKSPACE_NAVIGATION_ITEM_DROPPABLE_PREFIX
      : FAVORITE_NAVIGATION_ITEM_DROPPABLE_PREFIX;

  return droppableId.startsWith(prefix);
};
