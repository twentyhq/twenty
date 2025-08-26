import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useRecordTableRowDraggableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import { RecordTableCell } from '@/object-record/record-table/record-table-cell/components/RecordTableCell';
import { RecordTableCellWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellWrapper';
import { RecordTableTd } from 'twenty-ui/record-table';
import { isNonEmptyArray } from '~/utils/isNonEmptyArray';

export const RecordTableCellsVisible = () => {
  const { isSelected } = useRecordTableRowContextOrThrow();

  const { isDragging } = useRecordTableRowDraggableContextOrThrow();

  const { visibleRecordFields } = useRecordTableContextOrThrow();

  if (!isNonEmptyArray(visibleRecordFields)) {
    return null;
  }

  const recordFieldsAfterFirst = visibleRecordFields.slice(1);

  return (
    <>
      <RecordTableCellWrapper
        recordField={visibleRecordFields[0]}
        recordFieldIndex={0}
      >
        <RecordTableTd
          isSelected={isSelected}
          isDragging={isDragging}
          width={visibleRecordFields[0].size}
        >
          <RecordTableCell />
        </RecordTableTd>
      </RecordTableCellWrapper>
      {recordFieldsAfterFirst.map((recordField, recordFieldIndex) => (
        <RecordTableCellWrapper
          key={recordField.fieldMetadataItemId}
          recordField={recordField}
          recordFieldIndex={recordFieldIndex + 1}
        >
          <RecordTableTd
            isSelected={isSelected}
            isDragging={isDragging}
            width={recordField.size}
          >
            <RecordTableCell />
          </RecordTableTd>
        </RecordTableCellWrapper>
      ))}
    </>
  );
};
