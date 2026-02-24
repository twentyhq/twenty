import {
  DragDropContext,
  type DragStart,
  type DropResult,
} from '@hello-pangea/dnd';
import { type ReactNode, useCallback } from 'react';

import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecoilComponentSelectorCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorCallbackStateV2';
import { useStore } from 'jotai';

import { useEndRecordDrag } from '@/object-record/record-drag/hooks/useEndRecordDrag';
import { useProcessTableWithoutGroupRecordDrop } from '@/object-record/record-drag/hooks/useProcessTableWithoutGroupRecordDrop';
import { useStartRecordDrag } from '@/object-record/record-drag/hooks/useStartRecordDrag';
import { selectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/selectedRowIdsComponentSelector';

export const RecordTableBodyNoRecordGroupDragDropContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { recordIndexId } = useRecordIndexContextOrThrow();
  const { recordTableId } = useRecordTableContextOrThrow();

  const selectedRowIdsAtom = useRecoilComponentSelectorCallbackStateV2(
    selectedRowIdsComponentSelector,
    recordTableId,
  );

  const store = useStore();

  const { startRecordDrag } = useStartRecordDrag(recordIndexId);
  const { endRecordDrag } = useEndRecordDrag(recordIndexId);
  const { processTableWithoutGroupRecordDrop } =
    useProcessTableWithoutGroupRecordDrop();

  const handleDragStart = useCallback(
    (start: DragStart) => {
      const currentSelectedRecordIds = store.get(
        selectedRowIdsAtom,
      ) as string[];

      startRecordDrag(start, currentSelectedRecordIds);
    },
    [selectedRowIdsAtom, startRecordDrag, store],
  );

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      processTableWithoutGroupRecordDrop(result);
      endRecordDrag();
    },
    [endRecordDrag, processTableWithoutGroupRecordDrop],
  );

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {children}
    </DragDropContext>
  );
};
