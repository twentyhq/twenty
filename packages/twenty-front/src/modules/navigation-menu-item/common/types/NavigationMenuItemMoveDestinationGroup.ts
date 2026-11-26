import { type NavigationMenuItemMoveDestination } from '@/navigation-menu-item/common/types/NavigationMenuItemMoveDestination';

export type NavigationMenuItemMoveDestinationGroup = {
  tabId: string | null;
  destinations: NavigationMenuItemMoveDestination[];
};
