import type { DraggableData } from '@/navigation/utils/workspaceDndKitDraggableData';
import type { DropDestination } from '@/navigation/utils/workspaceDndKitDropDestination';

export const toDropResult = (
  draggableId: string,
  data: DraggableData | undefined,
  destination: DropDestination | null,
): {
  source: DropDestination;
  destination: DropDestination | null;
  draggableId: string;
} => {
  const sourceDroppableId = data?.sourceDroppableId ?? '';
  const sourceIndex = data?.sourceIndex ?? 0;
  return {
    source: { droppableId: sourceDroppableId, index: sourceIndex },
    destination,
    draggableId,
  };
};
