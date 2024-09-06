import { useRecoilValue } from 'recoil';

import { RecordTableRows } from '@/object-record/record-table/components/RecordTableRows';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { RecordTableBodyDragDropContext } from '@/object-record/record-table/record-table-body/components/RecordTableBodyDragDropContext';
import { RecordTableBodyDroppable } from '@/object-record/record-table/record-table-body/components/RecordTableBodyDroppable';
import { RecordTableBodyLoading } from '@/object-record/record-table/record-table-body/components/RecordTableBodyLoading';
import { RecordTablePendingRow } from '@/object-record/record-table/record-table-row/components/RecordTablePendingRow';

export const RecordTableBody = () => {
  const { tableRowIdsState, isRecordTableInitialLoadingState } =
    useRecordTableStates();

  const tableRowIds = useRecoilValue(tableRowIdsState);

  const isRecordTableInitialLoading = useRecoilValue(
    isRecordTableInitialLoadingState,
  );

  if (isRecordTableInitialLoading && tableRowIds.length === 0) {
    return <RecordTableBodyLoading />;
  }

  return (
    <RecordTableBodyDragDropContext>
      <RecordTableBodyDroppable>
        <RecordTablePendingRow />
        <RecordTableRows />
      </RecordTableBodyDroppable>
    </RecordTableBodyDragDropContext>
  );
};
