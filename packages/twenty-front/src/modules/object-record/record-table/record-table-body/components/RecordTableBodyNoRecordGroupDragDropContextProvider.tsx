import { DragDropProvider, DragOverlay } from '@dnd-kit/react';
import { useStore } from 'jotai';
import { type ReactNode, useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useEndRecordDrag } from '@/object-record/record-drag/hooks/useEndRecordDrag';
import { useProcessTableWithoutGroupRecordDrop } from '@/object-record/record-drag/hooks/useProcessTableWithoutGroupRecordDrop';
import { useStartRecordDrag } from '@/object-record/record-drag/hooks/useStartRecordDrag';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowDragOverlayContent } from '@/object-record/record-table/record-table-row/components/RecordTableRowDragOverlayContent';
import { selectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/selectedRowIdsComponentSelector';
import { type RecordTableRowDragData } from '@/object-record/record-table/types/RecordTableRowDragData';
import { DND_KIT_PROVIDER_PLUGINS_WITHOUT_DROP_ANIMATION } from '@/ui/utilities/drag-and-drop/constants/DndKitProviderPluginsWithoutDropAnimation';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';
import { type DragDropItemData } from '@/ui/utilities/drag-and-drop/types/DragDropItemData';
import { type DragDropProviderDragEndEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragEndEvent';
import { type DragDropProviderDragStartEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragStartEvent';
import { getDestinationIndex } from '@/ui/utilities/drag-and-drop/utils/getDestinationIndex';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';

export const RecordTableBodyNoRecordGroupDragDropContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { recordIndexId } = useRecordIndexContextOrThrow();
  const { recordTableId } = useRecordTableContextOrThrow();

  const selectedRowIds = useAtomComponentSelectorCallbackState(
    selectedRowIdsComponentSelector,
    recordTableId,
  );

  const store = useStore();

  const { startRecordDrag } = useStartRecordDrag(recordIndexId);
  const { endRecordDrag } = useEndRecordDrag(recordIndexId);
  const { processTableWithoutGroupRecordDrop } =
    useProcessTableWithoutGroupRecordDrop();

  const handleDragStart = useCallback(
    (event: DragDropProviderDragStartEvent<DragDropItemData>) => {
      const source = event.operation.source;
      const sourceData = source?.data as RecordTableRowDragData | undefined;

      if (!isDefined(source) || !isDefined(sourceData)) {
        return;
      }

      const currentSelectedRecordIds = store.get(selectedRowIds) as string[];

      startRecordDrag(sourceData.recordId, currentSelectedRecordIds);
    },
    [selectedRowIds, startRecordDrag, store],
  );

  const handleDragEnd = useCallback(
    (event: DragDropProviderDragEndEvent<DragDropItemData>) => {
      const source = event.operation.source;
      const sourceData = source?.data as RecordTableRowDragData | undefined;
      const targetData = event.operation.target?.data as
        | DragDropItemData
        | undefined;

      if (
        event.canceled ||
        !isDefined(source) ||
        !isDefined(sourceData) ||
        !isDefined(targetData)
      ) {
        endRecordDrag();
        return;
      }

      // Row targets and end drop zones mark the gap before them; convert that
      // gap into the index the dragged row will occupy after the move.
      const destinationIndex = getDestinationIndex({
        dropTargetIndex: targetData.index,
        sourceIndex: sourceData.index,
        sourceDroppableId: sourceData.droppableId,
        destinationDroppableId: targetData.droppableId,
      });

      if (destinationIndex === sourceData.index) {
        endRecordDrag();
        return;
      }

      try {
        processTableWithoutGroupRecordDrop({
          draggableId: sourceData.recordId,
          source: {
            droppableId: sourceData.droppableId,
            index: sourceData.index,
          },
          destination: {
            droppableId: targetData.droppableId,
            index: destinationIndex,
          },
        });
      } finally {
        endRecordDrag();
      }
    },
    [endRecordDrag, processTableWithoutGroupRecordDrop],
  );

  return (
    <DragDropProvider<DragDropItemData>
      sensors={DND_KIT_SENSORS}
      plugins={DND_KIT_PROVIDER_PLUGINS_WITHOUT_DROP_ANIMATION}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay>
        {(source) => <RecordTableRowDragOverlayContent source={source} />}
      </DragOverlay>
    </DragDropProvider>
  );
};
