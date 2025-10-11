import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useRecordTableRowDraggableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import { RecordTableCell } from '@/object-record/record-table/record-table-cell/components/RecordTableCell';
import { RecordTableCellFirstRowFirstColumn } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFirstRowFirstColumn';
import { RecordTableCellStyleWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellStyleWrapper';
import { RecordTableCellWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellWrapper';
import { getRecordTableColumnFieldWidthClassName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthClassName';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

export const RecordTableFieldsCells = () => {
  const { isSelected, rowIndex } = useRecordTableRowContextOrThrow();

  const { isDragging } = useRecordTableRowDraggableContextOrThrow();

  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const hasRecordGroups = useRecoilComponentValue(
    hasRecordGroupsComponentSelector,
  );

  if (!isNonEmptyArray(visibleRecordFields)) {
    return null;
  }

  const recordFieldsAfterFirst = visibleRecordFields.slice(1);

  const isFirstRow = rowIndex === 0;

  const firstRecordField = visibleRecordFields[0];

  if (!isDefined(firstRecordField)) {
    return null;
  }

  return (
    <>
      <RecordTableCellWrapper
        recordField={firstRecordField}
        recordFieldIndex={0}
      >
        {isFirstRow && !hasRecordGroups ? (
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
