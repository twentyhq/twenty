import type { DropDestination } from '@/navigation/types/workspaceDndKitDropDestination';

export type SortableTargetDestination = {
  destination: DropDestination;
  effectiveDropTargetId: string;
  isTargetFolder: boolean;
  dropTargetId: string;
};
