import { useRecoilValue } from 'recoil';

import { CheckboxCell } from '@/object-record/record-table/components/CheckboxCell';
import { GripCell } from '@/object-record/record-table/components/GripCell';
import {
  StyledTd,
  StyledTr,
} from '@/object-record/record-table/components/RecordTableRow';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { RecordTableCellLoading } from '@/object-record/record-table/record-table-cell/components/RecordTableCellLoading';

export const RecordTableBodyLoading = () => {
  const { visibleTableColumnsSelector } = useRecordTableStates();
  const visibleTableColumns = useRecoilValue(visibleTableColumnsSelector());

  return (
    <tbody>
      {Array.from({ length: 8 }).map((_, rowIndex) => (
        <StyledTr
          isDragging={false}
          data-testid={`row-id-${rowIndex}`}
          data-selectable-id={`row-id-${rowIndex}`}
          key={rowIndex}
        >
          <StyledTd data-select-disable>
            <GripCell isDragging={false} />
          </StyledTd>
          <StyledTd>
            <CheckboxCell />
          </StyledTd>
          {visibleTableColumns.map((column) => (
            <RecordTableCellLoading key={column.fieldMetadataId} />
          ))}
        </StyledTr>
      ))}
    </tbody>
  );
};
