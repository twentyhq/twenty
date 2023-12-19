import { useRecoilValue } from 'recoil';

import { RecordTableBodyFetchMoreLoader } from '@/object-record/record-table/components/RecordTableBodyFetchMoreLoader';
import { RecordTableRow } from '@/object-record/record-table/components/RecordTableRow';
import { RowIdContext } from '@/object-record/record-table/contexts/RowIdContext';
import { RowIndexContext } from '@/object-record/record-table/contexts/RowIndexContext';
import { isRecordTableFetchingMoreDataState } from '@/object-record/record-table/states/isRecordTableFetchingMoreDataState';
import { tableRowIdsState } from '@/object-record/record-table/states/tableRowIdsState';

export const RecordTableBody = () => {
  const tableRowIds = useRecoilValue(tableRowIdsState);

  const isFetchingRecordTableData = useRecoilValue(
    isRecordTableFetchingMoreDataState,
  );

  if (isFetchingRecordTableData) {
    return <></>;
  }

  return (
    <>
      {tableRowIds.map((rowId, rowIndex) => (
        <RowIdContext.Provider value={rowId} key={rowId}>
          <RowIndexContext.Provider value={rowIndex}>
            <RecordTableRow key={rowId} rowId={rowId} />
          </RowIndexContext.Provider>
        </RowIdContext.Provider>
      ))}
      <RecordTableBodyFetchMoreLoader />
    </>
  );
};
