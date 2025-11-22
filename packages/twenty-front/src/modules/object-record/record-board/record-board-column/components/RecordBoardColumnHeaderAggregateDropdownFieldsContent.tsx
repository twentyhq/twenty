import { useDropdownContextStateManagement } from '@/dropdown-context-state-management/hooks/useDropdownContextStateManagement';
import { RecordBoardColumnHeaderAggregateDropdownContext } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownContext';
import { aggregateOperationComponentState } from '@/object-record/record-board/record-board-column/states/aggregateOperationComponentState';
import { availableFieldIdsForAggregateOperationComponentState } from '@/object-record/record-board/record-board-column/states/availableFieldIdsForAggregateOperationComponentState';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { recordIndexGroupAggregateFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupAggregateFieldMetadataItemComponentState';
import { recordIndexGroupAggregateOperationComponentState } from '@/object-record/record-index/states/recordIndexGroupAggregateOperationComponentState';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useUpdateViewAggregate } from '@/views/hooks/useUpdateViewAggregate';
import { isDefined } from 'twenty-shared/utils';
import {
  Icon123,
  IconCheck,
  IconChevronLeft,
  useIcons,
} from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

export const RecordBoardColumnHeaderAggregateDropdownFieldsContent = () => {
  const {
    closeDropdown,
    objectMetadataItem,
    onContentChange,
    resetContent,
    previousContentId,
  } = useDropdownContextStateManagement({
    context: RecordBoardColumnHeaderAggregateDropdownContext,
  });

  const { updateViewAggregate } = useUpdateViewAggregate();

  const { getIcon } = useIcons();

  const aggregateOperation = useRecoilComponentValue(
    aggregateOperationComponentState,
  );

  const availableFieldsIdsForAggregateOperation = useRecoilComponentValue(
    availableFieldIdsForAggregateOperationComponentState,
  );

  const recordIndexGroupAggregateOperation = useRecoilComponentValue(
    recordIndexGroupAggregateOperationComponentState,
  );

  const recordIndexGroupAggregateFieldMetadataItem = useRecoilComponentValue(
    recordIndexGroupAggregateFieldMetadataItemComponentState,
  );

  if (!isDefined(aggregateOperation)) {
    return <></>;
  }

  return (
    <DropdownContent>
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
        {availableFieldsIdsForAggregateOperation.map((fieldId) => {
          const fieldMetadata = objectMetadataItem.fields.find(
            (field) => field.id === fieldId,
          );

          if (!fieldMetadata) return null;
          return (
            <MenuItem
              key={fieldId}
              onClick={() => {
                updateViewAggregate({
                  kanbanAggregateOperationFieldMetadataId: fieldId,
                  kanbanAggregateOperation: aggregateOperation,
                  objectMetadataItem,
                });
                closeDropdown();
              }}
              LeftIcon={getIcon(fieldMetadata.icon) ?? Icon123}
              text={fieldMetadata.label}
              RightIcon={
                recordIndexGroupAggregateFieldMetadataItem?.id === fieldId &&
                recordIndexGroupAggregateOperation === aggregateOperation
                  ? IconCheck
                  : undefined
              }
            />
          );
        })}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
