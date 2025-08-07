import { DragDropContext, DragStart, DropResult } from '@hello-pangea/dnd';
import { ReactNode } from 'react';
import { useRecoilCallback } from 'recoil';

import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';

import { useEndTableRowDrag } from '@/object-record/record-drag/table/hooks/useEndTableRowDrag';
import { useRecordTableDragOperations } from '@/object-record/record-drag/table/hooks/useRecordTableDragOperations';
import { useStartTableRowDrag } from '@/object-record/record-drag/table/hooks/useStartTableRowDrag';
import { selectedRowIdsComponentSelector } from '../../states/selectors/selectedRowIdsComponentSelector';

export const RecordTableBodyDragDropContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const selectedRowIdsSelector = useRecoilComponentCallbackState(
    selectedRowIdsComponentSelector,
    recordTableId,
  );

  const startDrag = useStartTableRowDrag(recordTableId);
  const endDrag = useEndTableRowDrag(recordTableId);
  const { processDragEndOperation } = useRecordTableDragOperations();

  const handleDragStart = useRecoilCallback(
    ({ snapshot }) =>
      (start: DragStart) => {
        const currentSelectedRecordIds = getSnapshotValue(
          snapshot,
          selectedRowIdsSelector,
        );

        startDrag(start, currentSelectedRecordIds);
      },
    [selectedRowIdsSelector, startDrag],
  );

  const handleDragEnd = useRecoilCallback(
    ({ snapshot }) =>
      (result: DropResult) => {
        processDragEndOperation(snapshot)(result);
        endDrag();
      },
    [endDrag, processDragEndOperation],
  );

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {children}
    </DragDropContext>
  );
};
