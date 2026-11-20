import { type NavigationMenuItemMoveDestination } from '@/navigation-menu-item/common/types/NavigationMenuItemMoveDestination';

export const getNavigationMenuItemMoveDestinationContainerId = (
  destination: NavigationMenuItemMoveDestination,
) => (destination.kind === 'root' ? destination.tabId : destination.item.id);
