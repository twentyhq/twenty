import { type AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableColumnAggregateFooterDropdownContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterDropdownContext';
import { NON_STANDARD_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/nonStandardAggregateOperationsOptions';
import { useViewFieldAggregateOperation } from '@/object-record/record-table/record-table-footer/hooks/useViewFieldAggregateOperation';
import { getAvailableAggregateOperationsForFieldMetadataType } from '@/object-record/record-table/record-table-footer/utils/getAvailableAggregateOperationsForFieldMetadataType';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { t } from '@lingui/core/macro';
import { useContext, useMemo } from 'react';
import { isDefined, isFieldMetadataDateKind } from 'twenty-shared/utils';
import { IconCheck } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const RecordTableColumnAggregateFooterMenuContent = () => {
  const {
    fieldMetadataId,
    dropdownId,
    onContentChange,
    fieldMetadataType,
    resetContent,
  } = useContext(RecordTableColumnAggregateFooterDropdownContext);
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
    <DropdownContent>
      <DropdownMenuItemsContainer>
        <MenuItem
          onClick={() => {
            onContentChange('countAggregateOperationsOptions');
          }}
          text={t`Count`}
          hasSubMenu
        />
        {!fieldIsRelation && (
          <MenuItem
            onClick={() => {
              onContentChange('percentAggregateOperationsOptions');
            }}
            text={t`Percent`}
            hasSubMenu
          />
        )}
        {fieldIsDateKind && (
          <MenuItem
            onClick={() => {
              onContentChange('datesAggregateOperationsOptions');
            }}
            text={t`Date`}
            hasSubMenu
          />
        )}
        {nonStandardAvailableAggregateOperation.length > 0 ? (
          <MenuItem
            onClick={() => {
              onContentChange('moreAggregateOperationOptions');
            }}
            text={t`More options`}
            hasSubMenu
          />
        ) : null}
        <MenuItem
          key="none"
          onClick={async () => {
            await updateViewFieldAggregateOperation(null);
            resetContent();
            closeDropdown(dropdownId);
          }}
          text={t`None`}
          RightIcon={
            !isDefined(currentViewFieldAggregateOperation)
              ? IconCheck
              : undefined
          }
          aria-selected={!isDefined(currentViewFieldAggregateOperation)}
        />
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
