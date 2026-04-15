import { isNonEmptyString } from '@sniptt/guards';

import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER } from '@/navigation-menu-item/common/constants/NavigationMenuItemDefaultColorFolder';
import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_LINK } from '@/navigation-menu-item/common/constants/NavigationMenuItemDefaultColorLink';
import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_PAGE_LAYOUT } from '@/navigation-menu-item/common/constants/NavigationMenuItemDefaultColorPageLayout';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { DEFAULT_THEME_COLOR_FALLBACK, type ThemeColor } from 'twenty-ui/theme';

export const getNavigationMenuItemColor = (
  navigationMenuItem: {
    type: NavigationMenuItemType;
    color?: string | null;
  },
  objectMetadataItem?: Pick<
    EnrichedObjectMetadataItem,
    'nameSingular' | 'color' | 'isSystem'
  >,
): ThemeColor => {
  if (navigationMenuItem.type === NavigationMenuItemType.FOLDER) {
    return isNonEmptyString(navigationMenuItem.color)
      ? (navigationMenuItem.color as ThemeColor)
      : DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER;
  }

  if (navigationMenuItem.type === NavigationMenuItemType.LINK) {
    return DEFAULT_NAVIGATION_MENU_ITEM_COLOR_LINK;
  }

  if (navigationMenuItem.type === NavigationMenuItemType.PAGE_LAYOUT) {
    return isNonEmptyString(navigationMenuItem.color)
      ? (navigationMenuItem.color as ThemeColor)
      : DEFAULT_NAVIGATION_MENU_ITEM_COLOR_PAGE_LAYOUT;
  }

  if (
    navigationMenuItem.type === NavigationMenuItemType.OBJECT ||
    navigationMenuItem.type === NavigationMenuItemType.VIEW
  ) {
    if (objectMetadataItem) {
      return getObjectColorWithFallback(objectMetadataItem);
    }
    return DEFAULT_THEME_COLOR_FALLBACK;
  }

  return DEFAULT_THEME_COLOR_FALLBACK;
};
