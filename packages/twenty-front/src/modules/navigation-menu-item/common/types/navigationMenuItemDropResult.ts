import type { DropDestination } from '@/navigation-menu-item/common/types/navigationMenuItemDndKitDropDestination';

export type NavigationMenuItemDropResult = {
  source: DropDestination;
  destination: DropDestination | null;
  draggableId: string;
  insertBeforeItemId?: string | null;
};
