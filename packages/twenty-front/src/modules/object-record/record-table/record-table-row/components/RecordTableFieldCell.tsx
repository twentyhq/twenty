import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { RecordTableCell } from '@/object-record/record-table/record-table-cell/components/RecordTableCell';
import { RecordTableCellStyleWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellStyleWrapper';
import { RecordTableCellWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellWrapper';
import { getRecordTableColumnFieldWidthClassName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthClassName';
import { memo } from 'react';

type RecordTableFieldCellProps = {
  recordField: RecordField;
  recordFieldIndex: number;
  isSelected: boolean;
  isDragging: boolean;
};

export const RecordTableFieldCell = memo(
  ({
    recordField,
    recordFieldIndex,
    isSelected,
    isDragging,
  }: RecordTableFieldCellProps) => (
    <RecordTableCellWrapper
      recordField={recordField}
      recordFieldIndex={recordFieldIndex}
    >
      <RecordTableCellStyleWrapper
        isSelected={isSelected}
        isDragging={isDragging}
        widthClassName={getRecordTableColumnFieldWidthClassName(
          recordFieldIndex,
        )}
      >
        <RecordTableCell />
      </RecordTableCellStyleWrapper>
    </RecordTableCellWrapper>
  ),
);
