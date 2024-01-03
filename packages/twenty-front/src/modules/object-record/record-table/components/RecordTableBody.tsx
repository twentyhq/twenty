import { useRecoilValue } from 'recoil';

import { RecordTableBodyFetchMoreLoader } from '@/object-record/record-table/components/RecordTableBodyFetchMoreLoader';
import { RecordTableRow } from '@/object-record/record-table/components/RecordTableRow';
import { RowIdContext } from '@/object-record/record-table/contexts/RowIdContext';
import { RowIndexContext } from '@/object-record/record-table/contexts/RowIndexContext';
import { useRecordTableScopedStates } from '@/object-record/record-table/hooks/internal/useRecordTableScopedStates';
import { getRecordTableScopeInjector } from '@/object-record/record-table/utils/getRecordTableScopeInjector';

export const RecordTableBody = () => {
  const { tableRowIdsScopeInjector } = getRecordTableScopeInjector();

  const { injectStateWithRecordTableScopeId } = useRecordTableScopedStates();

  const tableRowIdsState = injectStateWithRecordTableScopeId(
    tableRowIdsScopeInjector,
  );

  const tableRowIds = useRecoilValue(tableRowIdsState);

  return (
    <>
      <tbody>
        {tableRowIds.map((rowId, rowIndex) => (
          <RowIdContext.Provider value={rowId} key={rowId}>
            <RowIndexContext.Provider value={rowIndex}>
              <RecordTableRow key={rowId} rowId={rowId} />
            </RowIndexContext.Provider>
          </RowIdContext.Provider>
        ))}
      </tbody>
      <RecordTableBodyFetchMoreLoader />
    </>
  );
};
