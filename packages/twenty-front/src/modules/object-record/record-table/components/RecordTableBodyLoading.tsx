import { useRecoilValue } from 'recoil';

import { CheckboxCell } from '@/object-record/record-table/components/CheckboxCell';
import { GripCell } from '@/object-record/record-table/components/GripCell';
import { RecordTableTd } from '@/object-record/record-table/components/RecordTableTd';
import { StyledRecordTableTr } from '@/object-record/record-table/components/StyledRecordTableTr';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { RecordTableCellLoading } from '@/object-record/record-table/record-table-cell/components/RecordTableCellLoading';

export const RecordTableBodyLoading = () => {
  const { visibleTableColumnsSelector } = useRecordTableStates();
  const visibleTableColumns = useRecoilValue(visibleTableColumnsSelector());

  return (
    <tbody>
      {Array.from({ length: 8 }).map((_, rowIndex) => (
        <StyledRecordTableTr
          isDragging={false}
          data-testid={`row-id-${rowIndex}`}
          data-selectable-id={`row-id-${rowIndex}`}
          key={rowIndex}
        >
          <RecordTableTd data-select-disable>
            <GripCell isDragging={false} />
          </RecordTableTd>
          <RecordTableTd>
            <CheckboxCell />
          </RecordTableTd>
          {visibleTableColumns.map((column) => (
            <RecordTableCellLoading key={column.fieldMetadataId} />
          ))}
        </StyledRecordTableTr>
      ))}
    </tbody>
  );
};
