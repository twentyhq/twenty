import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableHeaderAddColumnButton } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderAddColumnButton';
import { RecordTableHeaderCell } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderCell';
import { RecordTableHeaderCheckboxColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderCheckboxColumn';
import { RecordTableHeaderDragDropColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderDragDropColumn';
import { RecordTableHeaderFirstScrollableCell } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderFirstScrollableCell';
import { RecordTableHeaderLabelIdentifierCell } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderLabelIdentifierCell';
import { RecordTableHeaderLastColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderLastColumn';
import { useResizeTableHeader } from '@/object-record/record-table/record-table-header/hooks/useResizeTableHeader';
import { filterOutByProperty } from 'twenty-shared/utils';

export const FIRST_TH_WIDTH = '10px';

export const RecordTableHeader = () => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();
  const { labelIdentifierFieldMetadataItem } = useRecordIndexContextOrThrow();

  const recordFieldsWithoutLabelIdentifierAndFirstOne = visibleRecordFields
    .filter(
      filterOutByProperty(
        'fieldMetadataItemId',
        labelIdentifierFieldMetadataItem?.id,
      ),
    )
    .slice(1);

  useResizeTableHeader();

  return (
    <>
      <RecordTableHeaderDragDropColumn />
      <RecordTableHeaderCheckboxColumn />
      <RecordTableHeaderLabelIdentifierCell />
      <RecordTableHeaderFirstScrollableCell />
      {recordFieldsWithoutLabelIdentifierAndFirstOne.map((recordField) => (
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
