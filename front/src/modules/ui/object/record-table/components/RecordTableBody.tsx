import { useRecoilValue } from 'recoil';

import { RecordTableBodyFetchMoreLoader } from '@/ui/object/record-table/components/RecordTableBodyFetchMoreLoader';
import { RecordTableRow } from '@/ui/object/record-table/components/RecordTableRow';
import { RowIdContext } from '@/ui/object/record-table/contexts/RowIdContext';
import { RowIndexContext } from '@/ui/object/record-table/contexts/RowIndexContext';
import { isFetchingRecordTableDataState } from '@/ui/object/record-table/states/isFetchingRecordTableDataState';
import { tableRowIdsState } from '@/ui/object/record-table/states/tableRowIdsState';

export const RecordTableBody = () => {
  const tableRowIds = useRecoilValue(tableRowIdsState);

  const isFetchingRecordTableData = useRecoilValue(
    isFetchingRecordTableDataState,
  );

  if (isFetchingRecordTableData) {
    return <></>;
  }

  return (
    <>
      {tableRowIds.slice().map((rowId, rowIndex) => (
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
