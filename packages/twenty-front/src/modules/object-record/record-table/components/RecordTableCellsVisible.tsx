import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { RecordTableCell } from '@/object-record/record-table/record-table-cell/components/RecordTableCell';
import { RecordTableCellTd } from '@/object-record/record-table/record-table-cell/components/RecordTableCellTd';
import { RecordTableCellWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellWrapper';

export const RecordTableCellsVisible = () => {
  const { isDragging } = useContext(RecordTableRowContext);
  const { visibleTableColumnsSelector } = useRecordTableStates();

  const visibleTableColumns = useRecoilValue(visibleTableColumnsSelector());

  const tableColumnsAfterFirst = visibleTableColumns.slice(1);

  return (
    <>
      <RecordTableCellWrapper column={visibleTableColumns[0]} columnIndex={0}>
        <RecordTableCellTd firstColumn>
          <RecordTableCell />
        </RecordTableCellTd>
      </RecordTableCellWrapper>
      {!isDragging &&
        tableColumnsAfterFirst.map((column, columnIndex) => (
          <RecordTableCellWrapper
            key={column.fieldMetadataId}
            column={column}
            columnIndex={columnIndex + 1}
          >
            <RecordTableCellTd>
              <RecordTableCell />
            </RecordTableCellTd>
          </RecordTableCellWrapper>
        ))}
    </>
  );
};
