import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useRecordTableRowDraggableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import { RecordTableCell } from '@/object-record/record-table/record-table-cell/components/RecordTableCell';
import { RecordTableCellFirstRowFirstColumn } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFirstRowFirstColumn';
import { RecordTableCellStyleWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellStyleWrapper';
import { RecordTableCellWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellWrapper';
import { getRecordTableColumnFieldWidthClassName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthClassName';
import { isNonEmptyArray } from '~/utils/isNonEmptyArray';

export const RecordTableCellsVisible = () => {
  const { isSelected, rowIndex } = useRecordTableRowContextOrThrow();

  const { isDragging } = useRecordTableRowDraggableContextOrThrow();

  const { visibleRecordFields } = useRecordTableContextOrThrow();

  if (!isNonEmptyArray(visibleRecordFields)) {
    return null;
  }

  const recordFieldsAfterFirst = visibleRecordFields.slice(1);

  const isFirstRow = rowIndex === 0;

  return (
    <>
      <RecordTableCellWrapper
        recordField={visibleRecordFields[0]}
        recordFieldIndex={0}
      >
        {isFirstRow ? (
          <RecordTableCellFirstRowFirstColumn
            isSelected={isSelected}
            isDragging={isDragging}
          >
            <RecordTableCell />
          </RecordTableCellFirstRowFirstColumn>
        ) : (
          <RecordTableCellStyleWrapper
            isSelected={isSelected}
            isDragging={isDragging}
            widthClassName={getRecordTableColumnFieldWidthClassName(0)}
          >
            <RecordTableCell />
          </RecordTableCellStyleWrapper>
        )}
      </RecordTableCellWrapper>
      {recordFieldsAfterFirst.map((recordField, recordFieldIndex) => (
        <RecordTableCellWrapper
          key={recordField.fieldMetadataItemId}
          recordField={recordField}
          recordFieldIndex={recordFieldIndex + 1}
        >
          <RecordTableCellStyleWrapper
            isSelected={isSelected}
            isDragging={isDragging}
            widthClassName={getRecordTableColumnFieldWidthClassName(
              recordFieldIndex + 1,
            )}
          >
            <RecordTableCell />
          </RecordTableCellStyleWrapper>
        </RecordTableCellWrapper>
      ))}
    </>
  );
};
