import { useRecoilValue } from 'recoil';

import { RowIdContext } from '../contexts/RowIdContext';
import { RowIndexContext } from '../contexts/RowIndexContext';
import { isFetchingRecordTableDataState } from '../states/isFetchingRecordTableDataState';
import { tableRowIdsState } from '../states/tableRowIdsState';

import { RecordTableRow } from './RecordTableRow';

export const RecordTableBodyV1 = () => {
  const tableRowIds = useRecoilValue(tableRowIdsState);

  const isFetchingRecordTableData = useRecoilValue(
    isFetchingRecordTableDataState,
  );

  if (isFetchingRecordTableData) {
    return <></>;
  }

  return (
    <tbody>
      {tableRowIds.map((rowId, rowIndex) => (
        <RowIdContext.Provider value={rowId} key={rowId}>
          <RowIndexContext.Provider value={rowIndex}>
            <RecordTableRow key={rowId} rowId={rowId} />
          </RowIndexContext.Provider>
        </RowIdContext.Provider>
      ))}
    </tbody>
  );
};
