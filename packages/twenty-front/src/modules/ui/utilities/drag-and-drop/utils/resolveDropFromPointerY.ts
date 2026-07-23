import { isSortable } from '@dnd-kit/react/sortable';
import { isDefined } from 'twenty-shared/utils';

import { type DragDropItemData } from '@/ui/utilities/drag-and-drop/types/DragDropItemData';
import { type DragDropProviderDropTarget } from '@/ui/utilities/drag-and-drop/types/DragDropProviderEvents';
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
}: {
  target: DropTarget;
  pointerY: number;
  getDroppableItemCount: (droppableId: string) => number;
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

  // Dropped over an empty droppable or the empty space below the cards
  const droppableId = String(target.id);

  return { droppableId, dropTargetIndex: getDroppableItemCount(droppableId) };
};
