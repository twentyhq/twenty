import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableColumnAggregateFooterDropdownContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterDropdownContext';
import { NON_STANDARD_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/nonStandardAggregateOperationsOptions';
import { useViewFieldAggregateOperation } from '@/object-record/record-table/record-table-footer/hooks/useViewFieldAggregateOperation';
import { getAvailableAggregateOperationsForFieldMetadataType } from '@/object-record/record-table/record-table-footer/utils/getAvailableAggregateOperationsForFieldMetadataType';
import { TableOptionsHotkeyScope } from '@/object-record/record-table/types/TableOptionsHotkeyScope';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useContext, useMemo } from 'react';
import { Key } from 'ts-key-enum';
import { isFieldMetadataDateKind } from 'twenty-shared';
import { IconCheck, isDefined, MenuItem } from 'twenty-ui';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const RecordTableColumnAggregateFooterMenuContent = () => {
  const {
    fieldMetadataId,
    dropdownId,
    onContentChange,
    fieldMetadataType,
    resetContent,
  } = useContext(RecordTableColumnAggregateFooterDropdownContext);
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

  const fieldIsDateKind = isFieldMetadataDateKind(fieldMetadataType);

  const nonStandardAvailableAggregateOperation =
    availableAggregateOperation.filter((aggregateOperation) =>
      NON_STANDARD_AGGREGATE_OPERATION_OPTIONS.includes(
        aggregateOperation as AGGREGATE_OPERATIONS,
      ),
    );

  const fieldIsRelation =
    objectMetadataItem.fields.find((field) => field.id === fieldMetadataId)
      ?.type === FieldMetadataType.Relation;

  const {
    updateViewFieldAggregateOperation,
    currentViewFieldAggregateOperation,
  } = useViewFieldAggregateOperation();

  return (
    <>
      <DropdownMenuItemsContainer>
        <MenuItem
          onClick={() => {
            onContentChange('countAggregateOperationsOptions');
          }}
          text={'Count'}
          hasSubMenu
        />
        {!fieldIsRelation && (
          <MenuItem
            onClick={() => {
              onContentChange('percentAggregateOperationsOptions');
            }}
            text={'Percent'}
            hasSubMenu
          />
        )}
        {fieldIsDateKind && (
          <MenuItem
            onClick={() => {
              onContentChange('datesAggregateOperationsOptions');
            }}
            text={'Dates'}
            hasSubMenu
          />
        )}
        {nonStandardAvailableAggregateOperation.length > 0 ? (
          <MenuItem
            onClick={() => {
              onContentChange('moreAggregateOperationOptions');
            }}
            text={'More options'}
            hasSubMenu
          />
        ) : null}
        <MenuItem
          key={'none'}
          onClick={() => {
            updateViewFieldAggregateOperation(null);
            resetContent();
            closeDropdown();
          }}
          text={'None'}
          RightIcon={
            !isDefined(currentViewFieldAggregateOperation)
              ? IconCheck
              : undefined
          }
          aria-selected={!isDefined(currentViewFieldAggregateOperation)}
        />
      </DropdownMenuItemsContainer>
    </>
  );
};
