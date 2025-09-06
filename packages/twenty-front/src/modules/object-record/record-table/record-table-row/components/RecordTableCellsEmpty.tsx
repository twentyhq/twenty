import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableTd } from '@/object-record/record-table/record-table-cell/components/RecordTableTd';

export const RecordTableCellsEmpty = () => {
  const { isSelected } = useRecordTableRowContextOrThrow();

  const { visibleRecordFields } = useRecordTableContextOrThrow();

  return visibleRecordFields.map((recordField) => (
    <RecordTableTd
      isSelected={isSelected}
      key={recordField.fieldMetadataItemId}
      width={recordField.size}
    />
  ));
};
