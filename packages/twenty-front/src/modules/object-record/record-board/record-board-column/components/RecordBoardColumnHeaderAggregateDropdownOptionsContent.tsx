import { useDropdown } from '@/dropdown/hooks/useDropdown';
import {
  RecordBoardColumnHeaderAggregateDropdownContext,
  RecordBoardColumnHeaderAggregateDropdownContextValue,
} from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownContext';
import { RecordBoardColumnHeaderAggregateDropdownMenuItem } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownMenuItem';
import { aggregateOperationComponentState } from '@/object-record/record-board/record-board-column/states/aggregateOperationComponentState';
import { availableFieldIdsForAggregateOperationComponentState } from '@/object-record/record-board/record-board-column/states/availableFieldIdsForAggregateOperationComponentState';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { TableOptionsHotkeyScope } from '@/object-record/record-table/types/TableOptionsHotkeyScope';
import { AvailableFieldsForAggregateOperation } from '@/object-record/types/AvailableFieldsForAggregateOperation';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useUpdateViewAggregate } from '@/views/hooks/useUpdateViewAggregate';
import isEmpty from 'lodash.isempty';
import { Key } from 'ts-key-enum';
import { IconChevronLeft } from 'twenty-ui';

export const RecordBoardColumnHeaderAggregateDropdownOptionsContent = ({
  availableAggregations,
  title,
}: {
  availableAggregations: AvailableFieldsForAggregateOperation;
  title: string;
}) => {
  const { onContentChange, closeDropdown, resetContent } =
    useDropdown<RecordBoardColumnHeaderAggregateDropdownContextValue>({
      context: RecordBoardColumnHeaderAggregateDropdownContext,
    });

  useScopedHotkeys(
    [Key.Escape],
    () => {
      closeDropdown();
    },
    TableOptionsHotkeyScope.Dropdown,
  );

  const setAggregateOperation = useSetRecoilComponentStateV2(
    aggregateOperationComponentState,
  );

  const setAvailableFieldsForAggregateOperation = useSetRecoilComponentStateV2(
    availableFieldIdsForAggregateOperationComponentState,
  );

  const { updateViewAggregate } = useUpdateViewAggregate();

  return (
    <>
      <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={resetContent}>
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
                    availableAggregationOperation !== AGGREGATE_OPERATIONS.count
                  ) {
                    setAggregateOperation(
                      availableAggregationOperation as AGGREGATE_OPERATIONS,
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
                        availableAggregationOperation as AGGREGATE_OPERATIONS,
                    });
                    closeDropdown();
                  }
                }}
                text={getAggregateOperationLabel(
                  availableAggregationOperation as AGGREGATE_OPERATIONS,
                )}
                hasSubMenu={
                  availableAggregationOperation === AGGREGATE_OPERATIONS.count
                    ? false
                    : true
                }
              />
            ),
          )}
      </DropdownMenuItemsContainer>
    </>
  );
};
