import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useRecordTableRowDraggableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import { RecordTableCell } from '@/object-record/record-table/record-table-cell/components/RecordTableCell';
import { RecordTableCellWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellWrapper';
import { RecordTableTd } from '@/object-record/record-table/record-table-cell/components/RecordTableTd';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isNonEmptyArray } from '~/utils/isNonEmptyArray';

export const RecordTableCellsVisible = () => {
  const { isSelected } = useRecordTableRowContextOrThrow();

  const { isDragging } = useRecordTableRowDraggableContextOrThrow();

  const visibleTableColumns = useRecoilComponentValueV2(
    visibleTableColumnsComponentSelector,
  );

  if (!isNonEmptyArray(visibleTableColumns)) {
    return null;
  }

  const tableColumnsAfterFirst = visibleTableColumns.slice(1);

  return (
    <>
      <RecordTableCellWrapper column={visibleTableColumns[0]} columnIndex={0}>
        <RecordTableTd
          isSelected={isSelected}
          isDragging={isDragging}
          width={visibleTableColumns[0].size}
        >
          <RecordTableCell />
        </RecordTableTd>
      </RecordTableCellWrapper>
      {tableColumnsAfterFirst.map((column, columnIndex) => (
        <RecordTableCellWrapper
          key={column.fieldMetadataId}
          column={column}
          columnIndex={columnIndex + 1}
        >
          <RecordTableTd
            isSelected={isSelected}
            isDragging={isDragging}
            width={column.size}
          >
            <RecordTableCell />
          </RecordTableTd>
        </RecordTableCellWrapper>
      ))}
    </>
  );
};
