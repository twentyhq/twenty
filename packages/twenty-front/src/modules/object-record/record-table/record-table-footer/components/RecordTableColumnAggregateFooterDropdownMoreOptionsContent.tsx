import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableColumnAggregateFooterAggregateOperationMenuItems } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterAggregateOperationMenuItems';
import { RecordTableColumnAggregateFooterDropdownContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterDropdownContext';
import { STANDARD_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/standardAggregateOperationOptions';
import { getAvailableAggregateOperationsForFieldMetadataType } from '@/object-record/record-table/record-table-footer/utils/getAvailableAggregateOperationsForFieldMetadataType';
import { TableOptionsHotkeyScope } from '@/object-record/record-table/types/TableOptionsHotkeyScope';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useContext, useMemo } from 'react';
import { Key } from 'ts-key-enum';
import { IconChevronLeft } from 'twenty-ui';

export const RecordTableColumnAggregateFooterDropdownMoreOptionsContent =
  () => {
    const { fieldMetadataId, dropdownId, resetContent } = useContext(
      RecordTableColumnAggregateFooterDropdownContext,
    );
    const { closeDropdown } = useDropdown(dropdownId);
    const { objectMetadataItem } = useRecordTableContextOrThrow();

    useScopedHotkeys(
      [Key.Escape],
      () => {
        resetContent();
        closeDropdown();
      },
      TableOptionsHotkeyScope.Dropdown,
    );

    const availableAggregateOperations = useMemo(
      () =>
        getAvailableAggregateOperationsForFieldMetadataType({
          fieldMetadataType: objectMetadataItem.fields.find(
            (field) => field.id === fieldMetadataId,
          )?.type,
        }).filter(
          (aggregateOperation) =>
            !STANDARD_AGGREGATE_OPERATION_OPTIONS.includes(aggregateOperation),
        ),
      [fieldMetadataId, objectMetadataItem.fields],
    );

    return (
      <>
        <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={resetContent}>
          More options
        </DropdownMenuHeader>
        <DropdownMenuItemsContainer>
          <RecordTableColumnAggregateFooterAggregateOperationMenuItems
            aggregateOperations={availableAggregateOperations}
          />
        </DropdownMenuItemsContainer>
      </>
    );
  };
