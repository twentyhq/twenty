import { useRecoilState, useRecoilValue } from 'recoil';

import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';
import {
  RecordTableRow,
  StyledRow,
} from '@/ui/object/record-table/components/RecordTableRow';
import { RowIdContext } from '@/ui/object/record-table/contexts/RowIdContext';
import { RowIndexContext } from '@/ui/object/record-table/contexts/RowIndexContext';
import { useRecordTable } from '@/ui/object/record-table/hooks/useRecordTable';
import { isFetchingRecordTableDataState } from '@/ui/object/record-table/states/isFetchingRecordTableDataState';
import { tableRowIdsState } from '@/ui/object/record-table/states/tableRowIdsState';

export const RecordTableBody = () => {
  const { scopeId } = useRecordTable();

  const tableRowIds = useRecoilValue(tableRowIdsState);

  const [isFetchingMoreObjects] = useRecoilState(
    isFetchingMoreRecordsFamilyState(scopeId),
  );

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
      {isFetchingMoreObjects && (
        <StyledRow selected={false}>
          <td style={{ height: 50 }} colSpan={1000}>
            Loading more...
          </td>
        </StyledRow>
      )}
    </tbody>
  );
};
