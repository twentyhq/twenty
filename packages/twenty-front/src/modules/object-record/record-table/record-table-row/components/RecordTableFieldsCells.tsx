import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';
import { useRecordTableColumnVirtualizationItemsContextOrThrow } from '@/object-record/record-table/contexts/RecordTableColumnVirtualizationItemsContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useRecordTableRowDraggableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import { RecordTableCell } from '@/object-record/record-table/record-table-cell/components/RecordTableCell';
import { RecordTableCellFirstRowFirstColumn } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFirstRowFirstColumn';
import { RecordTableCellStyleWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellStyleWrapper';
import { RecordTableCellWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellWrapper';
import { RecordTableFieldCell } from '@/object-record/record-table/record-table-row/components/RecordTableFieldCell';
import { getRecordTableColumnFieldWidthClassName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthClassName';
import { RecordTableColumnSpacer } from '@/object-record/record-table/virtualization/components/RecordTableColumnSpacer';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

export const RecordTableFieldsCells = () => {
  const { isSelected, rowIndex } = useRecordTableRowContextOrThrow();

  const { isDragging } = useRecordTableRowDraggableContextOrThrow();

  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const hasRecordGroups = useAtomComponentSelectorValue(
    hasRecordGroupsComponentSelector,
  );

  const columnVirtualizationItems =
    useRecordTableColumnVirtualizationItemsContextOrThrow();

  if (!isNonEmptyArray(visibleRecordFields)) {
    return null;
  }

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
      {columnVirtualizationItems.map((columnVirtualizationItem) => {
        if (columnVirtualizationItem.type === 'spacer') {
          return (
            <RecordTableColumnSpacer
              key={`spacer-${columnVirtualizationItem.firstColumnIndex}`}
              width={columnVirtualizationItem.width}
              hasBottomBorder={!isDragging}
            />
          );
        }

        const { columnIndex } = columnVirtualizationItem;
        const recordField = visibleRecordFields[columnIndex];

        return (
          <RecordTableFieldCell
            key={recordField.fieldMetadataItemId}
            recordField={recordField}
            recordFieldIndex={columnIndex}
            isSelected={isSelected}
            isDragging={isDragging}
          />
        );
      })}
    </>
  );
};
