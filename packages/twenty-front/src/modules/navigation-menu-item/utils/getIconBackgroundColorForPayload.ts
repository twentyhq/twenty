import type { Theme } from '@emotion/react';

import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import type { AddToNavigationDragPayload } from '@/navigation-menu-item/types/add-to-navigation-drag-payload';
import { getNavigationMenuItemIconColors } from '@/navigation-menu-item/utils/getNavigationMenuItemIconColors';

export const getIconBackgroundColorForPayload = (
  payload: AddToNavigationDragPayload,
  theme: Theme,
): string | undefined => {
  const colors = getNavigationMenuItemIconColors(theme);
  switch (payload.type) {
    case NavigationMenuItemType.OBJECT:
      return colors.object;
    case NavigationMenuItemType.VIEW:
      return colors.view;
    case NavigationMenuItemType.FOLDER:
      return colors.folder;
    case NavigationMenuItemType.LINK:
      return colors.link;
    case NavigationMenuItemType.RECORD:
      return undefined;
    default:
      return undefined;
  }
};
