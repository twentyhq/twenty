import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableColumnAggregateFooterDropdownContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterDropdownContext';
import { STANDARD_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/standardAggregateOperationOptions';
import { useViewFieldAggregateOperation } from '@/object-record/record-table/record-table-footer/hooks/useViewFieldAggregateOperation';
import { getAvailableAggregateOperationsForFieldMetadataType } from '@/object-record/record-table/record-table-footer/utils/getAvailableAggregateOperationsForFieldMetadataType';
import { TableOptionsHotkeyScope } from '@/object-record/record-table/types/TableOptionsHotkeyScope';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useContext, useMemo } from 'react';
import { Key } from 'ts-key-enum';
import { IconCheck, MenuItem } from 'twenty-ui';

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

    const {
      updateViewFieldAggregateOperation,
      currentViewFieldAggregateOperation,
    } = useViewFieldAggregateOperation();

    return (
      <>
        <DropdownMenuItemsContainer>
          {availableAggregateOperations.map((aggregateOperation) => (
            <MenuItem
              key={aggregateOperation}
              onClick={() => {
                updateViewFieldAggregateOperation(aggregateOperation);
                resetContent();
                closeDropdown();
              }}
              text={getAggregateOperationLabel(aggregateOperation)}
              RightIcon={
                currentViewFieldAggregateOperation === aggregateOperation
                  ? IconCheck
                  : undefined
              }
            />
          ))}
          <MenuItem
            key={'none'}
            onClick={() => {
              updateViewFieldAggregateOperation(null);
              resetContent();
              closeDropdown();
            }}
            text={'None'}
          />
        </DropdownMenuItemsContainer>
      </>
    );
  };
