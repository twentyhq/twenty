import { type NAVIGATION_MENU_BUILT_IN_SECTIONS } from '@/navigation-menu-item/common/constants/NavigationMenuBuiltInSections';

export type NavigationMenuBuiltInSectionType =
  (typeof NAVIGATION_MENU_BUILT_IN_SECTIONS)[number]['type'];
