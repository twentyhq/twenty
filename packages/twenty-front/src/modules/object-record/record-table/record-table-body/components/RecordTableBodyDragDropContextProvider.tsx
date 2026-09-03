import { type Draggable } from '@dnd-kit/dom';
import { DragDropProvider, DragOverlay } from '@dnd-kit/react';
import { useStore } from 'jotai';
import { type ReactNode, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useEndRecordDrag } from '@/object-record/record-drag/hooks/useEndRecordDrag';
import { useStartRecordDrag } from '@/object-record/record-drag/hooks/useStartRecordDrag';
import { type RecordDragDropResult } from '@/object-record/record-drag/types/RecordDragDropResult';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { selectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/selectedRowIdsComponentSelector';
import { type RecordTableRowDragData } from '@/object-record/record-table/types/RecordTableRowDragData';
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

type RecordTableBodyDragDropContextProviderProps = {
  getDroppableItemCount: (droppableId: string) => number;
  onRecordDrop: (result: RecordDragDropResult) => void;
  renderDragOverlay: (source: Draggable) => ReactNode;
  children: ReactNode;
};

export const RecordTableBodyDragDropContextProvider = ({
  getDroppableItemCount,
  onRecordDrop,
  renderDragOverlay,
  children,
}: RecordTableBodyDragDropContextProviderProps) => {
  const { recordIndexId } = useRecordIndexContextOrThrow();
  const { recordTableId } = useRecordTableContextOrThrow();

  const selectedRowIds = useAtomComponentSelectorCallbackState(
    selectedRowIdsComponentSelector,
    recordTableId,
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
    const sourceData = source?.data as RecordTableRowDragData | undefined;

    if (!isDefined(source) || !isDefined(sourceData)) {
      return;
    }

    const currentSelectedRecordIds = store.get(selectedRowIds) as string[];

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
    const sourceData = source?.data as RecordTableRowDragData | undefined;

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

    // Row targets and end drop zones mark the gap before them; convert that
    // gap into the index the dragged row will occupy after the move.
    const destinationIndex = getDestinationIndex({
      dropTargetIndex: resolvedDrop.dropTargetIndex,
      sourceIndex: sourceData.index,
      sourceDroppableId: sourceData.droppableId,
      destinationDroppableId: resolvedDrop.droppableId,
    });

    const isSameDroppable = sourceData.droppableId === resolvedDrop.droppableId;

    if (isSameDroppable && destinationIndex === sourceData.index) {
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
