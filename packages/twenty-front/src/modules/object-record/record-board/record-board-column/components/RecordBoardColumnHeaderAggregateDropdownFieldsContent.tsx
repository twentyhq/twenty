import { useDropdownContextStateManagement } from '@/dropdown-context-state-management/hooks/useDropdownContextStateManagement';
import { RecordBoardColumnHeaderAggregateDropdownContext } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownContext';
import { aggregateOperationComponentState } from '@/object-record/record-board/record-board-column/states/aggregateOperationComponentState';
import { availableFieldIdsForAggregateOperationComponentState } from '@/object-record/record-board/record-board-column/states/availableFieldIdsForAggregateOperationComponentState';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { recordIndexKanbanAggregateOperationState } from '@/object-record/record-index/states/recordIndexKanbanAggregateOperationState';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useUpdateViewAggregate } from '@/views/hooks/useUpdateViewAggregate';
import { useRecoilValue } from 'recoil';
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

  const recordIndexKanbanAggregateOperation = useRecoilValue(
    recordIndexKanbanAggregateOperationState,
  );

  if (!isDefined(aggregateOperation)) return <></>;
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
                });
                closeDropdown();
              }}
              LeftIcon={getIcon(fieldMetadata.icon) ?? Icon123}
              text={fieldMetadata.label}
              RightIcon={
                recordIndexKanbanAggregateOperation?.fieldMetadataId ===
                  fieldId &&
                recordIndexKanbanAggregateOperation?.operation ===
                  aggregateOperation
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
