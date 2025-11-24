import { useDropdownContextStateManagement } from '@/dropdown-context-state-management/hooks/useDropdownContextStateManagement';
import {
  RecordBoardColumnHeaderAggregateDropdownContext,
  type RecordBoardColumnHeaderAggregateDropdownContextValue,
} from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownContext';
import { RecordBoardColumnHeaderAggregateDropdownMenuItem } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownMenuItem';
import { aggregateOperationComponentState } from '@/object-record/record-board/record-board-column/states/aggregateOperationComponentState';
import { availableFieldIdsForAggregateOperationComponentState } from '@/object-record/record-board/record-board-column/states/availableFieldIdsForAggregateOperationComponentState';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { recordIndexGroupAggregateOperationComponentState } from '@/object-record/record-index/states/recordIndexGroupAggregateOperationComponentState';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { type AvailableFieldsForAggregateOperation } from '@/object-record/types/AvailableFieldsForAggregateOperation';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useUpdateViewAggregate } from '@/views/hooks/useUpdateViewAggregate';
import isEmpty from 'lodash.isempty';
import { IconCheck, IconChevronLeft } from 'twenty-ui/display';

export const RecordBoardColumnHeaderAggregateDropdownOptionsContent = ({
  availableAggregations,
  title,
}: {
  availableAggregations: AvailableFieldsForAggregateOperation;
  title: string;
}) => {
  const { onContentChange, closeDropdown, resetContent, objectMetadataItem } =
    useDropdownContextStateManagement<RecordBoardColumnHeaderAggregateDropdownContextValue>(
      {
        context: RecordBoardColumnHeaderAggregateDropdownContext,
      },
    );

  const setAggregateOperation = useSetRecoilComponentState(
    aggregateOperationComponentState,
  );

  const setAvailableFieldsForAggregateOperation = useSetRecoilComponentState(
    availableFieldIdsForAggregateOperationComponentState,
  );

  const { updateViewAggregate } = useUpdateViewAggregate();

  const recordIndexGroupAggregateOperation = useRecoilComponentValue(
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
              <RecordBoardColumnHeaderAggregateDropdownMenuItem
                key={`aggregate-dropdown-menu-content-${availableAggregationOperation}`}
                onContentChange={() => {
                  if (
                    availableAggregationOperation !== AggregateOperations.COUNT
                  ) {
                    setAggregateOperation(
                      availableAggregationOperation as ExtendedAggregateOperations,
                    );

                    setAvailableFieldsForAggregateOperation(
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
