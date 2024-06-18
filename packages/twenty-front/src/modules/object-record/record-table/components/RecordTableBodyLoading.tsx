import { useRecoilValue } from 'recoil';

import { CheckboxCell } from '@/object-record/record-table/components/CheckboxCell';
import { RecordTableCellFieldContextWrapper } from '@/object-record/record-table/components/RecordTableCellFieldContextWrapper';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';

export const RecordTableBodyLoading = () => {
  const { visibleTableColumnsSelector } = useRecordTableStates();
  const visibleTableColumns = useRecoilValue(visibleTableColumnsSelector());
  const skeletonColumnsWithSmallWidth = ['Domain Name', 'ICP', 'ARR', 'X'];

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
};
