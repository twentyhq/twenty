import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableColumnAggregateFooterAggregateOperationMenuItems } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterAggregateOperationMenuItems';
import { RecordTableColumnAggregateFooterDropdownContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterDropdownContext';
import { STANDARD_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/standardAggregateOperationOptions';
import { getAvailableAggregateOperationsForFieldMetadataType } from '@/object-record/record-table/record-table-footer/utils/getAvailableAggregateOperationsForFieldMetadataType';
import { TableOptionsHotkeyScope } from '@/object-record/record-table/types/TableOptionsHotkeyScope';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useContext, useMemo } from 'react';
import { Key } from 'ts-key-enum';
import { MenuItem } from 'twenty-ui';

export const RecordTableColumnAggregateFooterMenuContent = () => {
  const { fieldMetadataId, dropdownId, onContentChange } = useContext(
    RecordTableColumnAggregateFooterDropdownContext,
  );
  const { closeDropdown } = useDropdown(dropdownId);
  const { objectMetadataItem } = useRecordTableContextOrThrow();

  useScopedHotkeys(
    [Key.Escape],
    () => {
      closeDropdown();
    },
    TableOptionsHotkeyScope.Dropdown,
  );

  const availableAggregateOperation = useMemo(
    () =>
      getAvailableAggregateOperationsForFieldMetadataType({
        fieldMetadataType: objectMetadataItem.fields.find(
          (field) => field.id === fieldMetadataId,
        )?.type,
      }),
    [fieldMetadataId, objectMetadataItem.fields],
  );

  const standardAvailableAggregateOperation =
    availableAggregateOperation.filter((aggregateOperation) =>
      STANDARD_AGGREGATE_OPERATION_OPTIONS.includes(aggregateOperation),
    );

  const otherAvailableAggregateOperation = availableAggregateOperation.filter(
    (aggregateOperation) =>
      !STANDARD_AGGREGATE_OPERATION_OPTIONS.includes(aggregateOperation),
  );
  return (
    <>
      <DropdownMenuItemsContainer>
        <RecordTableColumnAggregateFooterAggregateOperationMenuItems
          aggregateOperations={standardAvailableAggregateOperation}
        >
          {otherAvailableAggregateOperation.length > 0 ? (
            <MenuItem
              key={'more-options'}
              onClick={() => {
                onContentChange('moreAggregateOperationOptions');
              }}
              text={'More options'}
              hasSubMenu
            />
          ) : null}
        </RecordTableColumnAggregateFooterAggregateOperationMenuItems>
      </DropdownMenuItemsContainer>
    </>
  );
};
