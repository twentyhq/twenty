import { type AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableColumnAggregateFooterDropdownContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterDropdownContext';
import { NON_STANDARD_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/nonStandardAggregateOperationsOptions';
import { useViewFieldAggregateOperation } from '@/object-record/record-table/record-table-footer/hooks/useViewFieldAggregateOperation';
import { getAvailableAggregateOperationsForFieldMetadataType } from '@/object-record/record-table/record-table-footer/utils/getAvailableAggregateOperationsForFieldMetadataType';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { t } from '@lingui/core/macro';
import { useContext, useMemo } from 'react';
import { isDefined, isFieldMetadataDateKind } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const RecordTableColumnAggregateFooterMenuContent = () => {
  const { fieldMetadataId, dropdownId, fieldMetadataType } = useContext(
    RecordTableColumnAggregateFooterDropdownContext,
  );
  const { closeDropdown } = useCloseDropdown();
  const { objectMetadataItem } = useRecordTableContextOrThrow();

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
        aggregateOperation as AggregateOperations,
      ),
    );

  const fieldIsRelation =
    objectMetadataItem.fields.find((field) => field.id === fieldMetadataId)
      ?.type === FieldMetadataType.RELATION;

  const {
    updateViewFieldAggregateOperation,
    currentViewFieldAggregateOperation,
  } = useViewFieldAggregateOperation();

  return (
    <>
      <Dropdown.Section>
        <Dropdown.ActionItem
          page="countAggregateOperationsOptions"
          hasSubmenu
        >{t`Count`}</Dropdown.ActionItem>
        {!fieldIsRelation && (
          <Dropdown.ActionItem
            page="percentAggregateOperationsOptions"
            hasSubmenu
          >{t`Percent`}</Dropdown.ActionItem>
        )}
        {fieldIsDateKind && (
          <Dropdown.ActionItem
            page="datesAggregateOperationsOptions"
            hasSubmenu
          >{t`Date`}</Dropdown.ActionItem>
        )}
        {nonStandardAvailableAggregateOperation.length > 0 ? (
          <Dropdown.ActionItem
            page="moreAggregateOperationOptions"
            hasSubmenu
          >{t`More options`}</Dropdown.ActionItem>
        ) : null}
        <Dropdown.OptionItem
          closeOnSelect={false}
          onSelect={async () => {
            await updateViewFieldAggregateOperation(null);
            closeDropdown(dropdownId);
          }}
          selected={!isDefined(currentViewFieldAggregateOperation)}
        >{t`None`}</Dropdown.OptionItem>
      </Dropdown.Section>
    </>
  );
};
