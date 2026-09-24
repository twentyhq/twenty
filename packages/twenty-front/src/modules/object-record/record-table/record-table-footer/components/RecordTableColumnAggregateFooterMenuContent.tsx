import { ListItem } from 'twenty-ui/primitives/navigation';
import { type AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableColumnAggregateFooterDropdownContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterDropdownContext';
import { NON_STANDARD_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/nonStandardAggregateOperationsOptions';
import { useViewFieldAggregateOperation } from '@/object-record/record-table/record-table-footer/hooks/useViewFieldAggregateOperation';
import { getAvailableAggregateOperationsForFieldMetadataType } from '@/object-record/record-table/record-table-footer/utils/getAvailableAggregateOperationsForFieldMetadataType';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { t } from '@lingui/core/macro';
import { useContext, useMemo } from 'react';
import { isDefined, isFieldMetadataDateKind } from 'twenty-shared/utils';
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
    <LegacyDropdownContent>
      <DropdownMenuItemsContainer>
        <ListItem
          onClick={() => {
            onContentChange('countAggregateOperationsOptions');
          }}
          hasSubmenu
        >{t`Count`}</ListItem>
        {!fieldIsRelation && (
          <ListItem
            onClick={() => {
              onContentChange('percentAggregateOperationsOptions');
            }}
            hasSubmenu
          >{t`Percent`}</ListItem>
        )}
        {fieldIsDateKind && (
          <ListItem
            onClick={() => {
              onContentChange('datesAggregateOperationsOptions');
            }}
            hasSubmenu
          >{t`Date`}</ListItem>
        )}
        {nonStandardAvailableAggregateOperation.length > 0 ? (
          <ListItem
            onClick={() => {
              onContentChange('moreAggregateOperationOptions');
            }}
            hasSubmenu
          >{t`More options`}</ListItem>
        ) : null}
        <ListItem
          onClick={async () => {
            await updateViewFieldAggregateOperation(null);
            resetContent();
            closeDropdown(dropdownId);
          }}
          indicator="check"
          selected={!isDefined(currentViewFieldAggregateOperation)}
        >{t`None`}</ListItem>
      </DropdownMenuItemsContainer>
    </LegacyDropdownContent>
  );
};
