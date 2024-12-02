import { useDropdown } from '@/dropdown/hooks/useDropdown';
import { RecordBoardColumnHeaderAggregateDropdownContext } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownContext';
import { aggregateDropdownState } from '@/object-record/record-board/record-board-column/states/aggregateDropdownState';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useUpdateViewAggregate } from '@/views/hooks/useUpdateViewAggregate';
import { useRecoilValue } from 'recoil';
import { Icon123, IconChevronLeft, MenuItem, useIcons } from 'twenty-ui';
import { isDefined } from '~/utils/isDefined';

export const RecordBoardColumnHeaderAggregateDropdownFieldsContent = () => {
  const aggregateDropdown = useRecoilValue(aggregateDropdownState);
  const { closeDropdown, resetContent, objectMetadataItem } = useDropdown({
    context: RecordBoardColumnHeaderAggregateDropdownContext,
  });

  const { updateViewAggregate } = useUpdateViewAggregate();

  const { getIcon } = useIcons();

  const operation = aggregateDropdown.operation;

  if (!isDefined(operation)) return <></>;

  return (
    <>
      <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={resetContent}>
        {getAggregateOperationLabel(operation)}
      </DropdownMenuHeader>
      {aggregateDropdown.availableFieldIdsForOperation.map((fieldId) => {
        const fieldMetadata = objectMetadataItem.fields.find(
          (field) => field.id === fieldId,
        );

        if (!fieldMetadata) return <></>;
        return (
          <DropdownMenuItemsContainer
            key={`dropdown-menu-items-container-${fieldId}`}
          >
            <MenuItem
              key={fieldId}
              onClick={() => {
                updateViewAggregate({
                  kanbanAggregateOperationFieldMetadataId: fieldId,
                  kanbanAggregateOperation: operation,
                });
                closeDropdown();
              }}
              LeftIcon={getIcon(fieldMetadata.icon) ?? Icon123}
              text={fieldMetadata.label}
            />
          </DropdownMenuItemsContainer>
        );
      })}
    </>
  );
};
