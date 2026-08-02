import { isSortable } from '@dnd-kit/react/sortable';
import { isDefined } from 'twenty-shared/utils';

import { type DragDropItemData } from '@/ui/utilities/drag-and-drop/types/DragDropItemData';
import { type DragDropProviderDropTarget } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDropTarget';

type DropTarget = DragDropProviderDropTarget<DragDropItemData>;

export const resolveDropFromPointerX = ({
  target,
  pointerX,
  totalSize,
  lastIndex,
}: {
  target: DropTarget;
  pointerX: number;
  totalSize: number;
  lastIndex: number;
}): number | null => {
  if (isSortable(target)) {
    const targetData = target.data as DragDropItemData | undefined;
    const columnShape = target.shape;

    if (!isDefined(targetData) || !isDefined(columnShape)) {
      return null;
    }

    const { left, width } = columnShape.boundingRectangle;
    const columnMidpointX = left + width / 2;

    return pointerX < columnMidpointX ? targetData.index : targetData.index + 1;
  }

  return pointerX > totalSize / 2 ? lastIndex : 0;
};
