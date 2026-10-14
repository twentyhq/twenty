import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useRecordTableRowDraggableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import { RecordTableCell } from '@/object-record/record-table/record-table-cell/components/RecordTableCell';
import { RecordTableCellFirstRowFirstColumn } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFirstRowFirstColumn';
import { RecordTableCellStyleWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellStyleWrapper';
import { RecordTableCellWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellWrapper';
import { RecordTableLeanCell } from '@/object-record/record-table/record-table-cell/components/RecordTableLeanCell';
import { RECORD_TABLE_LEAN_CELL_FIELD_TYPES } from '@/object-record/record-table/constants/RecordTableLeanCellFieldTypes';
import { isRecordTableCellsNonEditableComponentState } from '@/object-record/record-table/states/isRecordTableCellsNonEditableComponentState';
import { getRecordTableColumnFieldWidthClassName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthClassName';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

export const RecordTableFieldsCells = () => {
  const { isSelected, rowIndex } = useRecordTableRowContextOrThrow();

  const { isDragging } = useRecordTableRowDraggableContextOrThrow();

  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const hasRecordGroups = useAtomComponentSelectorValue(
    hasRecordGroupsComponentSelector,
  );
  const isRecordTableCellsNonEditable = useAtomComponentStateValue(
    isRecordTableCellsNonEditableComponentState,
  );
  const {
    fieldDefinitionByFieldMetadataItemId,
    labelIdentifierFieldMetadataItem,
  } = useRecordIndexContextOrThrow();

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
      {recordFieldsAfterFirst.map((recordField, recordFieldIndex) => {
        const fieldType =
          fieldDefinitionByFieldMetadataItemId[recordField.fieldMetadataItemId]
            ?.type;

        if (
          isDefined(fieldType) &&
          RECORD_TABLE_LEAN_CELL_FIELD_TYPES.has(fieldType) &&
          labelIdentifierFieldMetadataItem?.id !==
            recordField.fieldMetadataItemId
        ) {
          return (
            <RecordTableLeanCell
              key={recordField.fieldMetadataItemId}
              recordField={recordField}
              recordFieldIndex={recordFieldIndex + 1}
              isSelected={isSelected}
              isDragging={isDragging}
              isRecordTableCellsNonEditable={isRecordTableCellsNonEditable}
            />
          );
        }

        return (
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
        );
      })}
    </>
  );
};
