import { useEndRecordDrag } from '@/object-record/record-drag/hooks/useEndRecordDrag';
import { useProcessTableWithGroupRecordDrop } from '@/object-record/record-drag/hooks/useProcessTableWithGroupRecordDrop';
import { useStartRecordDrag } from '@/object-record/record-drag/hooks/useStartRecordDrag';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { selectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/selectedRowIdsComponentSelector';
import { useRecoilComponentSelectorCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorCallbackStateV2';
import { useStore } from 'jotai';
import {
  DragDropContext,
  type DragStart,
  type DropResult,
} from '@hello-pangea/dnd';
import { type ReactNode, useCallback } from 'react';

export const RecordTableBodyRecordGroupDragDropContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { recordIndexId } = useRecordIndexContextOrThrow();
  const { recordTableId } = useRecordTableContextOrThrow();

  const selectedRowIds = useRecoilComponentSelectorCallbackStateV2(
    selectedRowIdsComponentSelector,
    recordTableId,
  );

  const store = useStore();

  const { startRecordDrag } = useStartRecordDrag(recordIndexId);
  const { endRecordDrag } = useEndRecordDrag(recordIndexId);

  const { processTableWithGroupRecordDrop } =
    useProcessTableWithGroupRecordDrop();

  const handleDragStart = useCallback(
    (start: DragStart) => {
      const currentSelectedRecordIds = store.get(selectedRowIds) as string[];

      startRecordDrag(start, currentSelectedRecordIds);
    },
    [selectedRowIds, startRecordDrag, store],
  );

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      processTableWithGroupRecordDrop(result);

      endRecordDrag();
    },
    [endRecordDrag, processTableWithGroupRecordDrop],
  );

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {children}
    </DragDropContext>
  );
};
