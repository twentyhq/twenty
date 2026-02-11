import type { Theme } from '@emotion/react';

import type { AddToNavigationDragPayload } from '@/navigation-menu-item/types/add-to-navigation-drag-payload';
import { getNavigationMenuItemIconColors } from '@/navigation-menu-item/utils/getNavigationMenuItemIconColors';

export const getIconBackgroundColorForPayload = (
  payload: AddToNavigationDragPayload,
  theme: Theme,
): string | undefined => {
  const colors = getNavigationMenuItemIconColors(theme);
  switch (payload.type) {
    case 'object':
      return colors.object;
    case 'view':
      return colors.view;
    case 'folder':
      return colors.folder;
    case 'link':
      return colors.link;
    case 'record':
      return undefined;
    default:
      return undefined;
  }
};
