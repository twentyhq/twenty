import { useRecoilValue } from 'recoil';

import { CheckboxCell } from '@/object-record/record-table/components/CheckboxCell';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { RecordTableCellLoading } from '@/object-record/record-table/record-table-cell/components/RecordTableCellLoading';

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
          {visibleTableColumns.map((column) => (
            <RecordTableCellLoading
              key={column.fieldMetadataId}
              skeletonWidth={
                skeletonColumnsWithSmallWidth.includes(column.label) ? 108 : 132
              }
            />
          ))}
        </tr>
      ))}
    </tbody>
  );
};
