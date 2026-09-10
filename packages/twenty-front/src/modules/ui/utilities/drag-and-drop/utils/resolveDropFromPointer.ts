import { isSortable } from '@dnd-kit/react/sortable';
import { isDefined } from 'twenty-shared/utils';

import { type DragDropItemData } from '@/ui/utilities/drag-and-drop/types/DragDropItemData';
import { type DragDropItemDropTargetOrientation } from '@/ui/utilities/drag-and-drop/types/DragDropItemDropTargetOrientation';
import { type DragDropProviderDropTarget } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDropTarget';

type DropTarget = DragDropProviderDropTarget<DragDropItemData>;

export type ResolvedDrop = {
  droppableId: string;
  dropTargetIndex: number;
};

export const resolveDropFromPointer = ({
  target,
  pointer,
  defaultOrientation,
  getDroppableItemCount,
}: {
  target: DropTarget;
  pointer: { x: number; y: number };
  defaultOrientation?: DragDropItemDropTargetOrientation;
  getDroppableItemCount: (droppableId: string) => number;
}): ResolvedDrop | null => {
  if (!isDefined(target)) {
    return null;
  }

  const targetData = target.data as DragDropItemData | undefined;

  if (isSortable(target)) {
    const targetShape = target.shape;

    if (!isDefined(targetData) || !isDefined(targetShape)) {
      return null;
    }

    // The hovered item's own orientation wins, so a single provider can mix
    // lists of different axes; the default covers uniform single-axis lists.
    const orientation = targetData.orientation ?? defaultOrientation;
    const splitsOnX = orientation === 'vertical';

    const { left, top, width, height } = targetShape.boundingRectangle;
    const targetMidpoint = splitsOnX ? left + width / 2 : top + height / 2;
    const pointerMainAxis = splitsOnX ? pointer.x : pointer.y;

    const dropTargetIndex =
      pointerMainAxis < targetMidpoint
        ? targetData.index
        : targetData.index + 1;

    return { droppableId: targetData.droppableId, dropTargetIndex };
  }

  // Dropped over an empty droppable or the empty space past the last item. A
  // zone may tag a logical droppableId in its data; fall back to the raw id.
  const droppableId = targetData?.droppableId ?? String(target.id);

  return { droppableId, dropTargetIndex: getDroppableItemCount(droppableId) };
};
