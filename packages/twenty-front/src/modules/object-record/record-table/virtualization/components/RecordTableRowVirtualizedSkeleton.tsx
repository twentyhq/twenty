import { RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnAddColumnButtonWidthClassName';
import { RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnLastEmptyColumnWidthClassName';
import { useRecordTableBodyContextOrThrow } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableCellCheckboxPlaceholder } from '@/object-record/record-table/record-table-cell/components/RecordTableCellCheckboxPlaceholder';
import { RecordTableCellLoading } from '@/object-record/record-table/record-table-cell/components/RecordTableCellLoading';
import { RecordTableCellStyleWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellStyleWrapper';
import { RecordTableDragAndDropPlaceholderCell } from '@/object-record/record-table/record-table-cell/components/RecordTableDragAndDropPlaceholderCell';
import { RecordTableRowDiv } from '@/object-record/record-table/record-table-row/components/RecordTableRowDiv';

export const RecordTableRowVirtualizedSkeleton = () => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();
  const { hasUserSelectedAllRows } = useRecordTableBodyContextOrThrow();

  return (
    <RecordTableRowDiv isDragging={false}>
      <RecordTableDragAndDropPlaceholderCell />
      <RecordTableCellCheckboxPlaceholder />
      {visibleRecordFields.map((recordField, index) => (
        <RecordTableCellLoading
          key={recordField.fieldMetadataItemId}
          recordFieldIndex={index}
          isSelected={hasUserSelectedAllRows}
        />
      ))}
      <RecordTableCellStyleWrapper
        hasRightBorder={false}
        widthClassName={RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH_CLASS_NAME}
        isSelected={hasUserSelectedAllRows}
      />
      <RecordTableCellStyleWrapper
        hasRightBorder={false}
        widthClassName={RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_CLASS_NAME}
        isSelected={hasUserSelectedAllRows}
      />
    </RecordTableRowDiv>
  );
};
