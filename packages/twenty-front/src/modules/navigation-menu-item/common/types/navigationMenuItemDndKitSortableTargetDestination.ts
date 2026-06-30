import type { DropDestination } from '@/navigation-menu-item/common/types/navigationMenuItemDndKitDropDestination';

export type SortableTargetDestination = {
  destination: DropDestination;
  effectiveDropTargetId: string;
  isTargetFolder: boolean;
  dropTargetId: string;
  insertBeforeItemId?: string;
};
