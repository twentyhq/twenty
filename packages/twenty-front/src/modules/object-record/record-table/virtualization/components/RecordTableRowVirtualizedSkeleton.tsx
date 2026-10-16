import { RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnAddColumnButtonWidthClassName';
import { RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnLastEmptyColumnWidthClassName';
import { useRecordTableBodyContextOrThrow } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { useIsRecordTableCheckboxColumnHidden } from '@/object-record/record-table/hooks/useIsRecordTableCheckboxColumnHidden';
import { isRecordTableDragColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableDragColumnHiddenComponentState';
import { RecordTableCellCheckboxPlaceholder } from '@/object-record/record-table/record-table-cell/components/RecordTableCellCheckboxPlaceholder';
import { RecordTableCellStyleWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellStyleWrapper';
import { RecordTableDragAndDropPlaceholderCell } from '@/object-record/record-table/record-table-cell/components/RecordTableDragAndDropPlaceholderCell';
import { RecordTableFieldsCellsLoading } from '@/object-record/record-table/record-table-row/components/RecordTableFieldsCellsLoading';
import { RecordTableRowDiv } from '@/object-record/record-table/record-table-row/components/RecordTableRowDiv';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const RecordTableRowVirtualizedSkeleton = () => {
  const { hasUserSelectedAllRecords } = useRecordTableBodyContextOrThrow();

  const isRecordTableDragColumnHidden = useAtomComponentStateValue(
    isRecordTableDragColumnHiddenComponentState,
  );

  const isRecordTableCheckboxColumnHidden =
    useIsRecordTableCheckboxColumnHidden();

  return (
    <RecordTableRowDiv isDragging={false}>
      {!isRecordTableDragColumnHidden && (
        <RecordTableDragAndDropPlaceholderCell />
      )}
      {!isRecordTableCheckboxColumnHidden && (
        <RecordTableCellCheckboxPlaceholder />
      )}
      <RecordTableFieldsCellsLoading isSelected={hasUserSelectedAllRecords} />
      <RecordTableCellStyleWrapper
        hasRightBorder={false}
        widthClassName={RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH_CLASS_NAME}
        isSelected={hasUserSelectedAllRecords}
      />
      <RecordTableCellStyleWrapper
        hasRightBorder={false}
        widthClassName={RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_CLASS_NAME}
        isSelected={hasUserSelectedAllRecords}
      />
    </RecordTableRowDiv>
  );
};
