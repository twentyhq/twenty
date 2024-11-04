import { useContext } from 'react';

import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCell } from '@/object-record/record-table/record-table-cell/components/RecordTableCell';
import { RecordTableCellWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellWrapper';
import { RecordTableTd } from '@/object-record/record-table/record-table-cell/components/RecordTableTd';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const RecordTableCellsVisible = () => {
  const { isDragging, isSelected } = useContext(RecordTableRowContext);

  const visibleTableColumns = useRecoilComponentValueV2(
    visibleTableColumnsComponentSelector,
  );

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
