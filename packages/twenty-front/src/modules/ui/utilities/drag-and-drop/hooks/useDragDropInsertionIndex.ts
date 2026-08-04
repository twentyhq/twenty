import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { type DragDropItemData } from '@/ui/utilities/drag-and-drop/types/DragDropItemData';
import { type DragDropItemDropTargetOrientation } from '@/ui/utilities/drag-and-drop/types/DragDropItemDropTargetOrientation';
import { type DragDropProviderDragEndEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragEndEvent';
import { type DragDropProviderDragMoveEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragMoveEvent';
import { type DragDropProviderDragStartEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragStartEvent';
import { resolveDropFromPointer } from '@/ui/utilities/drag-and-drop/utils/resolveDropFromPointer';

type DragStartPayload = DragDropProviderDragStartEvent<DragDropItemData>;
type DragMovePayload = DragDropProviderDragMoveEvent<DragDropItemData>;
type DragEndPayload = DragDropProviderDragEndEvent<DragDropItemData>;

type DragDropSource = NonNullable<DragEndPayload['operation']['source']>;
type DragDropTarget = DragEndPayload['operation']['target'];

export type DragDropInsertionDropEvent = {
  source: DragDropSource;
  target: DragDropTarget;
  sourceIndex: number;
  droppableId: string;
  dropTargetIndex: number;
  event: DragEndPayload;
};

export type DragDropInsertionContextValues = {
  activeDropTargetIndex: number | null;
  activeDroppableId: string | null;
};

// Shared drop-indicator engine: tracks the active insertion boundary from the
// pointer and exposes it through context so DragDropItemDropTarget slots light
// up. Every reorderable list drives its own reorder from the onDrop callback.
export const useDragDropInsertionIndex = ({
  orientation,
  getDroppableItemCount,
  onDrop,
}: {
  // Fallback split axis for uniform lists; per-item orientation on the hovered
  // sortable's data overrides it, letting one provider mix axes.
  orientation?: DragDropItemDropTargetOrientation;
  getDroppableItemCount: (droppableId: string) => number;
  onDrop: (dropEvent: DragDropInsertionDropEvent) => void;
}): {
  contextValues: DragDropInsertionContextValues;
  handlers: {
    onDragStart: (event: DragStartPayload) => void;
    onDragMove: (event: DragMovePayload) => void;
    onDragEnd: (event: DragEndPayload) => void;
  };
} => {
  const [activeDropTargetIndex, setActiveDropTargetIndex] = useState<
    number | null
  >(null);
  const [activeDroppableId, setActiveDroppableId] = useState<string | null>(
    null,
  );

  const resolveDrop = (event: DragMovePayload | DragEndPayload) =>
    resolveDropFromPointer({
      target: event.operation.target,
      pointer: event.operation.position.current,
      defaultOrientation: orientation,
      getDroppableItemCount,
    });

  const clearActiveDropTarget = () => {
    setActiveDropTargetIndex(null);
    setActiveDroppableId(null);
  };

  const handleDragStart = (_event: DragStartPayload) => {
    clearActiveDropTarget();
  };

  const handleDragMove = (event: DragMovePayload) => {
    const resolvedDrop = resolveDrop(event);

    setActiveDropTargetIndex((currentActiveDropTargetIndex) =>
      currentActiveDropTargetIndex === resolvedDrop?.dropTargetIndex
        ? currentActiveDropTargetIndex
        : (resolvedDrop?.dropTargetIndex ?? null),
    );
    setActiveDroppableId(resolvedDrop?.droppableId ?? null);
  };

  const handleDragEnd = (event: DragEndPayload) => {
    clearActiveDropTarget();

    const source = event.operation.source;

    if (event.canceled || !isDefined(source)) {
      return;
    }

    const resolvedDrop = resolveDrop(event);

    if (!isDefined(resolvedDrop)) {
      return;
    }

    onDrop({
      source,
      target: event.operation.target,
      sourceIndex: source.data.index,
      droppableId: resolvedDrop.droppableId,
      dropTargetIndex: resolvedDrop.dropTargetIndex,
      event,
    });
  };

  return {
    contextValues: { activeDropTargetIndex, activeDroppableId },
    handlers: {
      onDragStart: handleDragStart,
      onDragMove: handleDragMove,
      onDragEnd: handleDragEnd,
    },
  };
};
