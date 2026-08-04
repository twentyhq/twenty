import { isSortable } from '@dnd-kit/react/sortable';
import { isDefined } from 'twenty-shared/utils';

import { type DragDropItemData } from '@/ui/utilities/drag-and-drop/types/DragDropItemData';
import { type DragDropProviderDropTarget } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDropTarget';
import { resolveDropTarget } from '@/ui/utilities/drag-and-drop/utils/resolveDropTarget';

type DropTarget = DragDropProviderDropTarget<DragDropItemData>;

export type ResolvedDrop = {
  droppableId: string;
  dropTargetIndex: number;
};

export const resolveDropFromPointerY = ({
  target,
  pointerY,
  getDroppableItemCount,
  resolveDroppableDropTargetIndex,
}: {
  target: DropTarget;
  pointerY: number;
  getDroppableItemCount: (droppableId: string) => number;
  resolveDroppableDropTargetIndex?: (args: {
    droppableId: string;
    pointerY: number;
  }) => number | null;
}): ResolvedDrop | null => {
  if (!isDefined(target)) {
    return null;
  }

  if (isSortable(target)) {
    const targetData = target.data as DragDropItemData | undefined;
    const cardShape = target.shape;

    if (!isDefined(targetData) || !isDefined(cardShape)) {
      return null;
    }

    const { dropTargetIndex } = resolveDropTarget({
      pointerY,
      cardPosition: targetData.index,
      cardShape,
    });

    return { droppableId: targetData.droppableId, dropTargetIndex };
  }

  // Dropped over the droppable itself, e.g. an empty column, a virtualization
  // placeholder or the empty space below the cards
  const droppableId = String(target.id);

  const resolvedDropTargetIndex = resolveDroppableDropTargetIndex?.({
    droppableId,
    pointerY,
  });

  if (isDefined(resolvedDropTargetIndex)) {
    return { droppableId, dropTargetIndex: resolvedDropTargetIndex };
  }

  return { droppableId, dropTargetIndex: getDroppableItemCount(droppableId) };
};
