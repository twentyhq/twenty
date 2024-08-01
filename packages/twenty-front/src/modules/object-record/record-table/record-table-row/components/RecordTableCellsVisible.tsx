import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { RecordTableCell } from '@/object-record/record-table/record-table-cell/components/RecordTableCell';
import { RecordTableCellWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellWrapper';
import { RecordTableTd } from '@/object-record/record-table/record-table-cell/components/RecordTableTd';

export const RecordTableCellsVisible = () => {
  const { isDragging, isSelected } = useContext(RecordTableRowContext);
  const { visibleTableColumnsSelector } = useRecordTableStates();

  const visibleTableColumns = useRecoilValue(visibleTableColumnsSelector());

  const tableColumnsAfterFirst = visibleTableColumns.slice(1);

  return (
    <>
      <RecordTableCellWrapper column={visibleTableColumns[0]} columnIndex={0}>
        <RecordTableTd isSelected={isSelected}>
          <RecordTableCell />
        </RecordTableTd>
      </RecordTableCellWrapper>
      {!isDragging &&
        tableColumnsAfterFirst.map((column, columnIndex) => (
          <RecordTableCellWrapper
            key={column.fieldMetadataId}
            column={column}
            columnIndex={columnIndex + 1}
          >
            <RecordTableTd isSelected={isSelected}>
              <RecordTableCell />
            </RecordTableTd>
          </RecordTableCellWrapper>
        ))}
    </>
  );
};
