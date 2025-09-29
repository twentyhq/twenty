import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellStyleWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellStyleWrapper';
import { getRecordTableColumnFieldWidthClassName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthClassName';

export const RecordTableCellsEmpty = () => {
  const { isSelected } = useRecordTableRowContextOrThrow();

  const { visibleRecordFields } = useRecordTableContextOrThrow();

  return visibleRecordFields.map((recordField, index) => (
    <RecordTableCellStyleWrapper
      isSelected={isSelected}
      key={recordField.fieldMetadataItemId}
      widthClassName={getRecordTableColumnFieldWidthClassName(index)}
    />
  ));
};
