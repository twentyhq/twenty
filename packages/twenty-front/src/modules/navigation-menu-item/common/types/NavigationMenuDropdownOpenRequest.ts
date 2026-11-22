import { type NavigationMenuItemAddTarget } from '@/navigation-menu-item/edit/types/NavigationMenuItemAddTarget';

export type NavigationMenuDropdownOpenRequest = {
  dropdownId: string;
  addTarget?: NavigationMenuItemAddTarget;
};
