import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { getAvailableAggregateOperationsForFieldMetadataType } from '@/object-record/record-table/record-table-footer/utils/getAvailableAggregateOperationsForFieldMetadataType';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { TableOptionsHotkeyScope } from '@/object-record/record-table/types/TableOptionsHotkeyScope';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { usePersistViewFieldRecords } from '@/views/hooks/internal/usePersistViewFieldRecords';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { useMemo } from 'react';
import { Key } from 'ts-key-enum';
import { MenuItem } from 'twenty-ui';

export const RecordTableColumnFooterDropdown = ({
  column,
}: {
  column: ColumnDefinition<FieldMetadata>;
}) => {
  const { closeDropdown } = useDropdown(column.fieldMetadataId + '-footer');
  const { objectMetadataItem } = useRecordTableContextOrThrow();
  const { currentViewWithSavedFiltersAndSorts } = useGetCurrentView();

  const currentViewField =
    currentViewWithSavedFiltersAndSorts?.viewFields?.find(
      (viewField) => viewField.fieldMetadataId === column.fieldMetadataId,
    );

  if (!currentViewField) {
    throw new Error('ViewField not found');
  }

  useScopedHotkeys(
    [Key.Escape],
    () => {
      closeDropdown();
    },
    TableOptionsHotkeyScope.Dropdown,
  );

  const availableAggregateOperations = useMemo(
    () =>
      getAvailableAggregateOperationsForFieldMetadataType({
        fieldMetadataType: objectMetadataItem.fields.find(
          (field) => field.id === column.fieldMetadataId,
        )?.type,
      }),
    [column.fieldMetadataId, objectMetadataItem.fields],
  );

  const { updateViewFieldRecords } = usePersistViewFieldRecords();
  const handleAggregationChange = (
    aggregateOperation: AGGREGATE_OPERATIONS,
  ) => {
    updateViewFieldRecords([
      { ...currentViewField, aggregateOperation: aggregateOperation },
    ]);
  };

  return (
    <>
      <DropdownMenuItemsContainer>
        {availableAggregateOperations.map((aggregation) => (
          <MenuItem
            key={aggregation}
            onClick={() => {
              handleAggregationChange(aggregation);
            }}
            text={getAggregateOperationLabel(aggregation)}
          />
        ))}
      </DropdownMenuItemsContainer>
    </>
  );
};
