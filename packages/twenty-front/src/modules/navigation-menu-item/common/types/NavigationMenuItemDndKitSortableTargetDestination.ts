import type { DropDestination } from '@/navigation-menu-item/common/types/NavigationMenuItemDndKitDropDestination';

export type SortableTargetDestination = {
  destination: DropDestination;
  effectiveDropTargetId: string;
  isTargetFolder: boolean;
  dropTargetId: string;
  insertBeforeItemId?: string;
};
