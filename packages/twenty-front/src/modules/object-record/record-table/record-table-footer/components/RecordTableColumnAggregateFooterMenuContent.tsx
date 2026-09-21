import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { getDropdownMenuItemClickHandler } from '@/ui/layout/dropdown/utils/getDropdownMenuItemClickHandler';
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
import { ListItem } from 'twenty-ui/primitives/navigation';
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
        <ListItem
          onClick={getDropdownMenuItemClickHandler(() => {
            onContentChange('countAggregateOperationsOptions');
          })}
          hasSubmenu
        >
          <OverflowingTextWithTooltip text={t`Count`} />
        </ListItem>
        {!fieldIsRelation && (
          <ListItem
            onClick={getDropdownMenuItemClickHandler(() => {
              onContentChange('percentAggregateOperationsOptions');
            })}
            hasSubmenu
          >
            <OverflowingTextWithTooltip text={t`Percent`} />
          </ListItem>
        )}
        {fieldIsDateKind && (
          <ListItem
            onClick={getDropdownMenuItemClickHandler(() => {
              onContentChange('datesAggregateOperationsOptions');
            })}
            hasSubmenu
          >
            <OverflowingTextWithTooltip text={t`Date`} />
          </ListItem>
        )}
        {nonStandardAvailableAggregateOperation.length > 0 ? (
          <ListItem
            onClick={getDropdownMenuItemClickHandler(() => {
              onContentChange('moreAggregateOperationOptions');
            })}
            hasSubmenu
          >
            <OverflowingTextWithTooltip text={t`More options`} />
          </ListItem>
        ) : null}
        <ListItem
          key="none"
          onClick={getDropdownMenuItemClickHandler(async () => {
            await updateViewFieldAggregateOperation(null);
            resetContent();
            closeDropdown(dropdownId);
          })}
          role="option"
          indicator="check"
          selected={!isDefined(currentViewFieldAggregateOperation)}
          aria-selected={!isDefined(currentViewFieldAggregateOperation)}
        >
          <OverflowingTextWithTooltip text={t`None`} />
        </ListItem>
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
