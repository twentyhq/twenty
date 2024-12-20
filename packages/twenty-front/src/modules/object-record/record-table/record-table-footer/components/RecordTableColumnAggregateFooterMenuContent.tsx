import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableColumnAggregateFooterDropdownContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterDropdownContext';
import { aggregateOperationForViewFieldState } from '@/object-record/record-table/record-table-footer/states/aggregateOperationForViewFieldState';
import { getAvailableAggregateOperationsForFieldMetadataType } from '@/object-record/record-table/record-table-footer/utils/getAvailableAggregateOperationsForFieldMetadataType';
import { TableOptionsHotkeyScope } from '@/object-record/record-table/types/TableOptionsHotkeyScope';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { usePersistViewFieldRecords } from '@/views/hooks/internal/usePersistViewFieldRecords';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { useContext, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';
import { IconCheck, MenuItem } from 'twenty-ui';

export const RecordTableColumnAggregateFooterMenuContent = () => {
  const { column, dropdownId } = useContext(
    RecordTableColumnAggregateFooterDropdownContext,
  );
  const { closeDropdown } = useDropdown(dropdownId);
  const { objectMetadataItem } = useRecordTableContextOrThrow();
  const { currentViewWithSavedFiltersAndSorts } = useGetCurrentView();

  const currentViewField =
    currentViewWithSavedFiltersAndSorts?.viewFields?.find(
      (viewField) => viewField.fieldMetadataId === column.fieldMetadataId,
    );

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
    aggregateOperation: AGGREGATE_OPERATIONS | null,
  ) => {
    if (!currentViewField) {
      throw new Error('ViewField not found');
    }
    updateViewFieldRecords([
      { ...currentViewField, aggregateOperation: aggregateOperation },
    ]);
  };

  const viewFieldId =
    currentViewWithSavedFiltersAndSorts?.viewFields?.find(
      (viewField) => viewField.fieldMetadataId === column.fieldMetadataId,
    )?.id ?? '';

  const aggregateOperationForViewField = useRecoilValue(
    aggregateOperationForViewFieldState({ viewFieldId: viewFieldId }),
  );

  return (
    <>
      <DropdownMenuItemsContainer>
        {availableAggregateOperations.map((aggregation) => (
          <MenuItem
            key={aggregation}
            onClick={() => {
              handleAggregationChange(aggregation);
              closeDropdown();
            }}
            text={getAggregateOperationLabel(aggregation)}
            RightIcon={
              aggregateOperationForViewField === aggregation
                ? IconCheck
                : undefined
            }
          />
        ))}
        <MenuItem
          key={'more-options'}
          onClick={() => {
            handleAggregationChange(null);
            closeDropdown();
          }}
          text={'More options'}
          hasSubMenu
        />
        <MenuItem
          key={'none'}
          onClick={() => {
            handleAggregationChange(null);
            closeDropdown();
          }}
          text={'None'}
        />
      </DropdownMenuItemsContainer>
    </>
  );
};
