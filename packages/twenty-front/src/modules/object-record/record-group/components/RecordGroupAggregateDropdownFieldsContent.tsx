import { ListItem } from 'twenty-ui/primitives/navigation';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useDropdownContextStateManagement } from '@/dropdown-context-state-management/hooks/useDropdownContextStateManagement';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { RecordGroupAggregateDropdownContext } from '@/object-record/record-group/states/context/RecordGroupAggregateDropdownContext';
import { aggregateOperationComponentState } from '@/object-record/record-group/states/aggregateOperationComponentState';
import { availableFieldIdsForAggregateOperationComponentState } from '@/object-record/record-group/states/availableFieldIdsForAggregateOperationComponentState';
import { recordIndexGroupAggregateFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupAggregateFieldMetadataItemComponentState';
import { recordIndexGroupAggregateOperationComponentState } from '@/object-record/record-index/states/recordIndexGroupAggregateOperationComponentState';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useUpdateViewAggregate } from '@/views/hooks/useUpdateViewAggregate';
import { isDefined } from 'twenty-shared/utils';
import { Icon123, IconChevronLeft, useIcons } from 'twenty-ui/icon';

export const RecordGroupAggregateDropdownFieldsContent = () => {
  const {
    closeDropdown,
    objectMetadataItem,
    onContentChange,
    resetContent,
    previousContentId,
  } = useDropdownContextStateManagement({
    context: RecordGroupAggregateDropdownContext,
  });

  const { updateViewAggregate } = useUpdateViewAggregate();

  const { getIcon } = useIcons();

  const aggregateOperation = useAtomComponentStateValue(
    aggregateOperationComponentState,
  );

  const availableFieldIdsForAggregateOperation = useAtomComponentStateValue(
    availableFieldIdsForAggregateOperationComponentState,
  );

  const recordIndexGroupAggregateOperation = useAtomComponentStateValue(
    recordIndexGroupAggregateOperationComponentState,
  );

  const recordIndexGroupAggregateFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupAggregateFieldMetadataItemComponentState,
  );

  if (!isDefined(aggregateOperation)) {
    return <></>;
  }

  return (
    <LegacyDropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={() =>
              previousContentId
                ? onContentChange(previousContentId)
                : resetContent()
            }
            Icon={IconChevronLeft}
          />
        }
      >
        {getAggregateOperationLabel(aggregateOperation)}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        {availableFieldIdsForAggregateOperation.map((fieldId) => {
          const fieldMetadata = objectMetadataItem.fields.find(
            (field) => field.id === fieldId,
          );

          if (!fieldMetadata) return null;

          const isSelected =
            recordIndexGroupAggregateFieldMetadataItem?.id === fieldId &&
            recordIndexGroupAggregateOperation === aggregateOperation;

          return (
            <ListItem
              key={fieldId}
              onClick={() => {
                updateViewAggregate({
                  kanbanAggregateOperationFieldMetadataId: fieldId,
                  kanbanAggregateOperation: aggregateOperation,
                  objectMetadataItem,
                });
                closeDropdown();
              }}
              startIcon={
                <SelectOptionIcon
                  Icon={getIcon(fieldMetadata.icon) ?? Icon123}
                />
              }
              role="option"
              aria-selected={isSelected}
              indicator="check"
              selected={isSelected}
            >
              {fieldMetadata.label}
            </ListItem>
          );
        })}
      </DropdownMenuItemsContainer>
    </LegacyDropdownContent>
  );
};
