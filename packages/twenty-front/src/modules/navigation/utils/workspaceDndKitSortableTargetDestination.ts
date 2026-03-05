import type { DropDestination } from '@/navigation/utils/workspaceDndKitDropDestination';

export type SortableTargetDestination = {
  destination: DropDestination;
  effectiveDropTargetId: string;
  isTargetFolder: boolean;
  dropTargetId: string;
};
