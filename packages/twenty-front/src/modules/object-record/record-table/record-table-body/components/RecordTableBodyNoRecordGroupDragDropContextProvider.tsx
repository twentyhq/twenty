import {
  DragDropContext,
  type DragStart,
  type DropResult,
} from '@hello-pangea/dnd';
import { type ReactNode } from 'react';
import { useRecoilCallback } from 'recoil';

import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';

import { useEndRecordDrag } from '@/object-record/record-drag/shared/hooks/useEndRecordDrag';
import { useStartRecordDrag } from '@/object-record/record-drag/shared/hooks/useStartRecordDrag';
import { useRecordTableWithoutGroupDragOperations } from '@/object-record/record-drag/table/hooks/useRecordTableWithoutGroupDragOperations';
import { selectedRowIdsComponentSelector } from '../../states/selectors/selectedRowIdsComponentSelector';

export const RecordTableBodyNoRecordGroupDragDropContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const selectedRowIdsSelector = useRecoilComponentCallbackState(
    selectedRowIdsComponentSelector,
    recordTableId,
  );

  const { startDrag } = useStartRecordDrag('table', recordTableId);
  const { endDrag } = useEndRecordDrag('table', recordTableId);
  const { processDragOperationWithoutGroup } =
    useRecordTableWithoutGroupDragOperations();

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
    () => (result: DropResult) => {
      processDragOperationWithoutGroup(result);
      endDrag();
    },
    [endDrag, processDragOperationWithoutGroup],
  );

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {children}
    </DragDropContext>
  );
};
