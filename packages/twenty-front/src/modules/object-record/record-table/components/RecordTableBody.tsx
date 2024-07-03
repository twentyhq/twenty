import { useRecoilValue } from 'recoil';

import { RecordTableBodyDragDropContext } from '@/object-record/record-table/components/RecordTableBodyDragDropContext';
import { RecordTableBodyDroppable } from '@/object-record/record-table/components/RecordTableBodyDroppable';
import { RecordTableBodyLoading } from '@/object-record/record-table/components/RecordTableBodyLoading';
import { RecordTablePendingRow } from '@/object-record/record-table/components/RecordTablePendingRow';
import { RecordTableRow } from '@/object-record/record-table/components/RecordTableRow';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';

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
        {tableRowIds.map((recordId, rowIndex) => {
          return (
            <RecordTableRow
              key={recordId}
              recordId={recordId}
              rowIndex={rowIndex}
            />
          );
        })}
      </RecordTableBodyDroppable>
    </RecordTableBodyDragDropContext>
  );
};
