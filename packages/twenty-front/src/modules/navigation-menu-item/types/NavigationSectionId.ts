import { type NAVIGATION_SECTIONS } from '@/navigation-menu-item/constants/NavigationSections.constants';

export type NavigationSectionId =
  (typeof NAVIGATION_SECTIONS)[keyof typeof NAVIGATION_SECTIONS];
