import { SortableDroppable } from '@dnd-kit/dom/sortable';

import { type DragDropItemData } from '@/ui/utilities/drag-and-drop/types/DragDropItemData';
import { type DragDropProviderDropTarget } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDropTarget';
import { resolveDropFromPointer } from '@/ui/utilities/drag-and-drop/utils/resolveDropFromPointer';

type DropTarget = DragDropProviderDropTarget<DragDropItemData>;

// Instances are built on the real SortableDroppable prototype so the
// resolver's isSortable discrimination stays exercised.
const createSortableTarget = ({
  data,
  boundingRectangle,
}: {
  data: DragDropItemData;
  boundingRectangle: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
}): DropTarget => {
  const target = Object.create(SortableDroppable.prototype);

  Object.defineProperty(target, 'data', { value: data });
  Object.defineProperty(target, 'shape', { value: { boundingRectangle } });

  return target as DropTarget;
};

const createDroppableTarget = ({
  id,
  data,
}: {
  id: string;
  data?: Partial<DragDropItemData>;
}): DropTarget => ({ id, data }) as DropTarget;

const CARD_RECTANGLE = { left: 100, top: 200, width: 80, height: 40 };

describe('resolveDropFromPointer', () => {
  it('should return null without a target', () => {
    const result = resolveDropFromPointer({
      target: null,
      pointer: { x: 0, y: 0 },
      getDroppableItemCount: () => 0,
    });

    expect(result).toBeNull();
  });

  it('should target the hovered item before its midpoint on the horizontal default axis', () => {
    const result = resolveDropFromPointer({
      target: createSortableTarget({
        data: { droppableId: 'list', index: 2 },
        boundingRectangle: CARD_RECTANGLE,
      }),
      pointer: { x: 0, y: 210 },
      defaultOrientation: 'horizontal',
      getDroppableItemCount: () => 5,
    });

    expect(result).toEqual({ droppableId: 'list', dropTargetIndex: 2 });
  });

  it('should target the next slot past the hovered item midpoint on the horizontal default axis', () => {
    const result = resolveDropFromPointer({
      target: createSortableTarget({
        data: { droppableId: 'list', index: 2 },
        boundingRectangle: CARD_RECTANGLE,
      }),
      pointer: { x: 0, y: 230 },
      defaultOrientation: 'horizontal',
      getDroppableItemCount: () => 5,
    });

    expect(result).toEqual({ droppableId: 'list', dropTargetIndex: 3 });
  });

  it('should split on the x axis for a vertical orientation', () => {
    const result = resolveDropFromPointer({
      target: createSortableTarget({
        data: { droppableId: 'columns', index: 1 },
        boundingRectangle: CARD_RECTANGLE,
      }),
      pointer: { x: 170, y: 0 },
      defaultOrientation: 'vertical',
      getDroppableItemCount: () => 5,
    });

    expect(result).toEqual({ droppableId: 'columns', dropTargetIndex: 2 });
  });

  it('should let the hovered item orientation override the default orientation', () => {
    const result = resolveDropFromPointer({
      target: createSortableTarget({
        data: { droppableId: 'tabs', index: 1, orientation: 'vertical' },
        boundingRectangle: CARD_RECTANGLE,
      }),
      // Before the item's x midpoint but past its y midpoint: the item's own
      // vertical axis must win over the horizontal default.
      pointer: { x: 110, y: 230 },
      defaultOrientation: 'horizontal',
      getDroppableItemCount: () => 5,
    });

    expect(result).toEqual({ droppableId: 'tabs', dropTargetIndex: 1 });
  });

  it('should append into a plain droppable using its tagged droppableId', () => {
    const result = resolveDropFromPointer({
      target: createDroppableTarget({
        id: 'group-end-zone',
        data: { droppableId: 'group-1' },
      }),
      pointer: { x: 0, y: 0 },
      getDroppableItemCount: (droppableId) =>
        droppableId === 'group-1' ? 4 : 0,
    });

    expect(result).toEqual({ droppableId: 'group-1', dropTargetIndex: 4 });
  });

  it('should fall back to the droppable id when the droppable tags no data', () => {
    const result = resolveDropFromPointer({
      target: createDroppableTarget({ id: 'group-2' }),
      pointer: { x: 0, y: 0 },
      getDroppableItemCount: (droppableId) =>
        droppableId === 'group-2' ? 3 : 0,
    });

    expect(result).toEqual({ droppableId: 'group-2', dropTargetIndex: 3 });
  });
});
