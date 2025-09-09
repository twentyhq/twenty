import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableHeaderAddColumnButton } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderAddColumnButton';
import { RecordTableHeaderCell } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderCell';
import { RecordTableHeaderCheckboxColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderCheckboxColumn';
import { RecordTableHeaderDragDropColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderDragDropColumn';
import { RecordTableHeaderLastColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderLastColumn';

export const FIRST_TH_WIDTH = '10px';

export const RecordTableHeader = () => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();

  return (
    <>
      <RecordTableHeaderDragDropColumn />
      <RecordTableHeaderCheckboxColumn />
      {visibleRecordFields.map((recordField) => (
        <RecordTableHeaderCell
          key={recordField.fieldMetadataItemId}
          recordField={recordField}
        />
      ))}
      <RecordTableHeaderAddColumnButton />
      <RecordTableHeaderLastColumn />
    </>
  );
};
