import { type Draggable } from '@dnd-kit/dom';
import { DragDropProvider, DragOverlay } from '@dnd-kit/react';
import { useStore } from 'jotai';
import { type ReactNode, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useEndRecordDrag } from '@/object-record/record-drag/hooks/useEndRecordDrag';
import { useStartRecordDrag } from '@/object-record/record-drag/hooks/useStartRecordDrag';
import { type RecordDragData } from '@/object-record/record-drag/types/RecordDragData';
import { type RecordDragDropResult } from '@/object-record/record-drag/types/RecordDragDropResult';
import { getDragOperationType } from '@/object-record/record-drag/utils/getDragOperationType';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { selectedRecordIdsComponentSelector } from '@/object-record/record-selection/states/selectors/selectedRecordIdsComponentSelector';
import { DND_KIT_PROVIDER_PLUGINS_WITHOUT_DROP_ANIMATION } from '@/ui/utilities/drag-and-drop/constants/DndKitProviderPluginsWithoutDropAnimation';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';
import { DragDropItemDndContext } from '@/ui/utilities/drag-and-drop/context/DragDropItemDndContext';
import { type DragDropItemData } from '@/ui/utilities/drag-and-drop/types/DragDropItemData';
import { type DragDropProviderDragEndEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragEndEvent';
import { type DragDropProviderDragMoveEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragMoveEvent';
import { type DragDropProviderDragStartEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragStartEvent';
import { getDestinationIndex } from '@/ui/utilities/drag-and-drop/utils/getDestinationIndex';
import { resolveDropFromPointer } from '@/ui/utilities/drag-and-drop/utils/resolveDropFromPointer';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';

type RecordDragDropContextProviderProps = {
  getDroppableItemCount: (droppableId: string) => number;
  onRecordDrop: (result: RecordDragDropResult) => void;
  renderDragOverlay: (source: Draggable) => ReactNode;
  children: ReactNode;
};

export const RecordDragDropContextProvider = ({
  getDroppableItemCount,
  onRecordDrop,
  renderDragOverlay,
  children,
}: RecordDragDropContextProviderProps) => {
  const { recordIndexId } = useRecordIndexContextOrThrow();

  const selectedRecordIds = useAtomComponentSelectorCallbackState(
    selectedRecordIdsComponentSelector,
  );

  const store = useStore();

  const { startRecordDrag } = useStartRecordDrag(recordIndexId);
  const { endRecordDrag } = useEndRecordDrag(recordIndexId);

  const [activeDropTargetIndex, setActiveDropTargetIndex] = useState<
    number | null
  >(null);
  const [activeDroppableId, setActiveDroppableId] = useState<string | null>(
    null,
  );

  const clearDragState = () => {
    endRecordDrag();
    setActiveDropTargetIndex(null);
    setActiveDroppableId(null);
  };

  const handleDragStart = (
    event: DragDropProviderDragStartEvent<DragDropItemData>,
  ) => {
    const source = event.operation.source;
    const sourceData = source?.data as RecordDragData | undefined;

    if (!isDefined(source) || !isDefined(sourceData)) {
      return;
    }

    const currentSelectedRecordIds = store.get(selectedRecordIds);

    startRecordDrag(sourceData.recordId, currentSelectedRecordIds);
  };

  const handleDragMove = (
    event: DragDropProviderDragMoveEvent<DragDropItemData>,
  ) => {
    const { target, position } = event.operation;

    const resolvedDrop = resolveDropFromPointer({
      target,
      pointer: position.current,
      defaultOrientation: 'horizontal',
      getDroppableItemCount,
    });

    setActiveDropTargetIndex(resolvedDrop?.dropTargetIndex ?? null);
    setActiveDroppableId(resolvedDrop?.droppableId ?? null);
  };

  const handleDragEnd = (
    event: DragDropProviderDragEndEvent<DragDropItemData>,
  ) => {
    const { source, target, position } = event.operation;
    const sourceData = source?.data as RecordDragData | undefined;

    if (event.canceled || !isDefined(source) || !isDefined(sourceData)) {
      clearDragState();
      return;
    }

    const resolvedDrop = resolveDropFromPointer({
      target,
      pointer: position.current,
      defaultOrientation: 'horizontal',
      getDroppableItemCount,
    });

    if (!isDefined(resolvedDrop)) {
      clearDragState();
      return;
    }

    // Drop targets mark the gap before them; convert it to the dragged record's final index.
    const destinationIndex = getDestinationIndex({
      dropTargetIndex: resolvedDrop.dropTargetIndex,
      sourceIndex: sourceData.index,
      sourceDroppableId: sourceData.droppableId,
      destinationDroppableId: resolvedDrop.droppableId,
    });

    const isSameDroppable = sourceData.droppableId === resolvedDrop.droppableId;

    const isMultiDrag =
      getDragOperationType({
        draggedRecordId: sourceData.recordId,
        selectedRecordIds: store.get(selectedRecordIds),
      }) === 'multi';

    if (
      isSameDroppable &&
      destinationIndex === sourceData.index &&
      !isMultiDrag
    ) {
      clearDragState();
      return;
    }

    try {
      onRecordDrop({
        draggableId: sourceData.recordId,
        source: {
          droppableId: sourceData.droppableId,
          index: sourceData.index,
        },
        destination: {
          droppableId: resolvedDrop.droppableId,
          index: destinationIndex,
        },
      });
    } finally {
      clearDragState();
    }
  };

  return (
    <DragDropItemDndContext.Provider
      value={{ activeDropTargetIndex, activeDroppableId }}
    >
      <DragDropProvider<DragDropItemData>
        sensors={DND_KIT_SENSORS}
        plugins={DND_KIT_PROVIDER_PLUGINS_WITHOUT_DROP_ANIMATION}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        {children}
        <DragOverlay>{renderDragOverlay}</DragOverlay>
      </DragDropProvider>
    </DragDropItemDndContext.Provider>
  );
};
