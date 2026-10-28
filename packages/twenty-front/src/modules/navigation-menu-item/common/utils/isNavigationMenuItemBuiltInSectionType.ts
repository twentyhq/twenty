import { type NavigationMenuItemType } from 'twenty-shared/types';

import { NAVIGATION_MENU_ITEM_BUILT_IN_SECTIONS } from '@/navigation-menu-item/common/constants/NavigationMenuItemBuiltInSections';
import { type NavigationMenuItemBuiltInSectionType } from '@/navigation-menu-item/common/types/NavigationMenuItemBuiltInSectionType';

export const isNavigationMenuItemBuiltInSectionType = (
  type: NavigationMenuItemType,
): type is NavigationMenuItemBuiltInSectionType =>
  type in NAVIGATION_MENU_ITEM_BUILT_IN_SECTIONS;
