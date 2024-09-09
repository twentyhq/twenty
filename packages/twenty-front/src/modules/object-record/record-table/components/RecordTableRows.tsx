import { useRecoilValue } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { RecordTableBodyFetchMoreLoader } from '@/object-record/record-table/record-table-body/components/RecordTableBodyFetchMoreLoader';
import { RecordTableRow } from '@/object-record/record-table/record-table-row/components/RecordTableRow';

export const RecordTableRows = () => {
  const { tableRowIdsState } = useRecordTableStates();

  const tableRowIds = useRecoilValue(tableRowIdsState);

  return (
    <>
      {tableRowIds.map((recordId, rowIndex) => {
        return (
          <RecordTableRow
            key={recordId}
            recordId={recordId}
            rowIndex={rowIndex}
          />
        );
      })}
      <RecordTableBodyFetchMoreLoader />
    </>
  );
};
