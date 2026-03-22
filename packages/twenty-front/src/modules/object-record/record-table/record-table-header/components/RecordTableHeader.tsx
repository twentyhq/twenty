import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableHeaderAddColumnButton } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderAddColumnButton';
import { RecordTableHeaderCell } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderCell';
import { RecordTableHeaderCheckboxColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderCheckboxColumn';
import { RecordTableHeaderDragDropColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderDragDropColumn';
import { RecordTableHeaderFirstCell } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderFirstCell';
import { RecordTableHeaderFirstScrollableCell } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderFirstScrollableCell';
import { RecordTableHeaderLastEmptyColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderLastEmptyColumn';
import { useResizeTableHeader } from '@/object-record/record-table/record-table-header/hooks/useResizeTableHeader';
import { styled } from '@linaria/react';
import { filterOutByProperty } from 'twenty-shared/utils';

const StyledHeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  position: sticky;
  top: 0;
  z-index: ${TABLE_Z_INDEX.headerRow};
`;

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
    <StyledHeaderContainer>
      <RecordTableHeaderDragDropColumn />
      <RecordTableHeaderCheckboxColumn />
      <RecordTableHeaderFirstCell />
      <RecordTableHeaderFirstScrollableCell />
      {recordFieldsWithoutLabelIdentifierAndFirstOne.map(
        (recordField, index) => (
          <RecordTableHeaderCell
            key={recordField.fieldMetadataItemId}
            recordField={recordField}
            recordFieldIndex={index + 2}
          />
        ),
      )}
      <RecordTableHeaderAddColumnButton />
      <RecordTableHeaderLastEmptyColumn />
    </StyledHeaderContainer>
  );
};
