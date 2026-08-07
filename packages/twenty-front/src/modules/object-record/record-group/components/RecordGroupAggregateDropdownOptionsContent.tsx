import { useDropdownContextStateManagement } from '@/dropdown-context-state-management/hooks/useDropdownContextStateManagement';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { RecordGroupAggregateDropdownMenuItem } from '@/object-record/record-group/components/RecordGroupAggregateDropdownMenuItem';
import { RecordGroupAggregateDropdownContext } from '@/object-record/record-group/states/context/RecordGroupAggregateDropdownContext';
import { type RecordGroupAggregateDropdownContextValue } from '@/object-record/record-group/types/RecordGroupAggregateDropdownContextValue';
import { aggregateOperationComponentState } from '@/object-record/record-group/states/aggregateOperationComponentState';
import { availableFieldIdsForAggregateOperationComponentState } from '@/object-record/record-group/states/availableFieldIdsForAggregateOperationComponentState';
import { recordIndexGroupAggregateOperationComponentState } from '@/object-record/record-index/states/recordIndexGroupAggregateOperationComponentState';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { type AvailableFieldsForAggregateOperation } from '@/object-record/types/AvailableFieldsForAggregateOperation';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useUpdateViewAggregate } from '@/views/hooks/useUpdateViewAggregate';
import isEmpty from 'lodash.isempty';
import { IconCheck, IconChevronLeft } from 'twenty-ui/icon';

export const RecordGroupAggregateDropdownOptionsContent = ({
  availableAggregations,
  title,
}: {
  availableAggregations: AvailableFieldsForAggregateOperation;
  title: string;
}) => {
  const { onContentChange, closeDropdown, resetContent, objectMetadataItem } =
    useDropdownContextStateManagement<RecordGroupAggregateDropdownContextValue>(
      {
        context: RecordGroupAggregateDropdownContext,
      },
    );

  const setAggregateOperation = useSetAtomComponentState(
    aggregateOperationComponentState,
  );

  const setAvailableFieldIdsForAggregateOperation = useSetAtomComponentState(
    availableFieldIdsForAggregateOperationComponentState,
  );

  const { updateViewAggregate } = useUpdateViewAggregate();

  const recordIndexGroupAggregateOperation = useAtomComponentStateValue(
    recordIndexGroupAggregateOperationComponentState,
  );

  return (
    <DropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={resetContent}
            Icon={IconChevronLeft}
          />
        }
      >
        {title}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        {Object.entries(availableAggregations)
          .filter(([, fields]) => !isEmpty(fields))
          .map(
            ([
              availableAggregationOperation,
              availableAggregationFieldsIdsForOperation,
            ]) => (
              <RecordGroupAggregateDropdownMenuItem
                key={`aggregate-dropdown-menu-content-${availableAggregationOperation}`}
                onContentChange={() => {
                  if (
                    availableAggregationOperation !== AggregateOperations.COUNT
                  ) {
                    setAggregateOperation(
                      availableAggregationOperation as ExtendedAggregateOperations,
                    );

                    setAvailableFieldIdsForAggregateOperation(
                      availableAggregationFieldsIdsForOperation,
                    );
                    onContentChange('aggregateFields');
                  } else {
                    updateViewAggregate({
                      kanbanAggregateOperationFieldMetadataId:
                        availableAggregationFieldsIdsForOperation[0],
                      kanbanAggregateOperation:
                        availableAggregationOperation as AggregateOperations,
                      objectMetadataItem,
                    });
                    closeDropdown();
                  }
                }}
                text={getAggregateOperationLabel(
                  availableAggregationOperation as ExtendedAggregateOperations,
                )}
                hasSubMenu={
                  availableAggregationOperation === AggregateOperations.COUNT
                    ? false
                    : true
                }
                RightIcon={
                  availableAggregationOperation === AggregateOperations.COUNT &&
                  recordIndexGroupAggregateOperation ===
                    AggregateOperations.COUNT
                    ? IconCheck
                    : undefined
                }
              />
            ),
          )}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
