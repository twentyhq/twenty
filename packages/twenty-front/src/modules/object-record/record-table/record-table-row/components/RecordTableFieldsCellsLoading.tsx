import { useRecordTableColumnVirtualizationItemsContextOrThrow } from '@/object-record/record-table/contexts/RecordTableColumnVirtualizationItemsContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableCellLoading } from '@/object-record/record-table/record-table-cell/components/RecordTableCellLoading';
import { RecordTableColumnSpacer } from '@/object-record/record-table/virtualization/components/RecordTableColumnSpacer';
import { isNonEmptyArray } from 'twenty-shared/utils';

type RecordTableFieldsCellsLoadingProps = {
  isSelected?: boolean;
};

export const RecordTableFieldsCellsLoading = ({
  isSelected,
}: RecordTableFieldsCellsLoadingProps) => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const columnVirtualizationItems =
    useRecordTableColumnVirtualizationItemsContextOrThrow();

  if (!isNonEmptyArray(visibleRecordFields)) {
    return null;
  }

  return (
    <>
      <RecordTableCellLoading recordFieldIndex={0} isSelected={isSelected} />
      {columnVirtualizationItems.map((columnVirtualizationItem) => {
        if (columnVirtualizationItem.type === 'spacer') {
          return (
            <RecordTableColumnSpacer
              key={`spacer-${columnVirtualizationItem.firstColumnIndex}`}
              width={columnVirtualizationItem.width}
              hasBottomBorder
            />
          );
        }

        const { columnIndex } = columnVirtualizationItem;

        return (
          <RecordTableCellLoading
            key={visibleRecordFields[columnIndex].fieldMetadataItemId}
            recordFieldIndex={columnIndex}
            isSelected={isSelected}
          />
        );
      })}
    </>
  );
};
