import { useRecoilValue } from 'recoil';

import { CheckboxCell } from '@/object-record/record-table/components/CheckboxCell';
import { RecordTableBodyFetchMoreLoader } from '@/object-record/record-table/components/RecordTableBodyFetchMoreLoader';
import { RecordTableCellFieldContextWrapper } from '@/object-record/record-table/components/RecordTableCellFieldContextWrapper';
import { RecordTablePendingRow } from '@/object-record/record-table/components/RecordTablePendingRow';
import { RecordTableRow } from '@/object-record/record-table/components/RecordTableRow';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';

type RecordTableBodyProps = {
  objectNameSingular: string;
};

export const RecordTableBody = ({
  objectNameSingular,
}: RecordTableBodyProps) => {
  const {
    tableRowIdsState,
    isRecordTableInitialLoadingState,
    visibleTableColumnsSelector,
  } = useRecordTableStates();

  const tableRowIds = useRecoilValue(tableRowIdsState);
  const visibleTableColumns = useRecoilValue(visibleTableColumnsSelector());

  const isRecordTableInitialLoading = useRecoilValue(
    isRecordTableInitialLoadingState,
  );
  const skeletonColumnsWithSmallWidth = ['Domain Name', 'ICP', 'ARR', 'X'];

  if (isRecordTableInitialLoading && tableRowIds.length === 0) {
    return (
      <tbody>
        {Array.from({ length: 8 }).map((_, rowIndex) => (
          <tr
            data-testid={`row-id-${rowIndex}`}
            data-selectable-id={`row-id-${rowIndex}`}
          >
            <td>
              <CheckboxCell />
            </td>
            {visibleTableColumns.map((column, columnIndex) => (
              <RecordTableCellContext.Provider
                value={{
                  columnDefinition: column,
                  columnIndex,
                }}
                key={column.fieldMetadataId}
              >
                <RecordTableCellFieldContextWrapper
                  skeletonWidth={
                    skeletonColumnsWithSmallWidth.includes(column.label)
                      ? 108
                      : 132
                  }
                />
              </RecordTableCellContext.Provider>
            ))}
          </tr>
        ))}
      </tbody>
    );
  }

  return (
    <>
      <tbody>
        <RecordTablePendingRow />
        {tableRowIds.map((recordId, rowIndex) => (
          <RecordTableRow
            key={recordId}
            recordId={recordId}
            rowIndex={rowIndex}
          />
        ))}
      </tbody>
      <RecordTableBodyFetchMoreLoader objectNameSingular={objectNameSingular} />
    </>
  );
};
