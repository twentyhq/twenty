import { Key } from 'ts-key-enum';
import { MenuItem } from 'twenty-ui';

import { useDropdown } from '@/dropdown/hooks/useDropdown';
import {
  RecordBoardColumnHeaderAggregateDropdownContext,
  RecordBoardColumnHeaderAggregateDropdownContextValue,
} from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownContext';

import { RecordBoardColumnHeaderAggregateDropdownMenuItem } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownMenuItem';
import { aggregateDropdownState } from '@/object-record/record-board/record-board-column/states/aggregateDropdownState';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { TableOptionsHotkeyScope } from '@/object-record/record-table/types/TableOptionsHotkeyScope';
import { getAvailableFieldsForAggregationFromObjectFieldss } from '@/object-record/utils/getAvailableFieldsForAggregationFromObjectFields';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useUpdateViewAggregate } from '@/views/hooks/useUpdateViewAggregate';
import isEmpty from 'lodash.isempty';
import { useMemo } from 'react';
import { useSetRecoilState } from 'recoil';

export const RecordBoardColumnHeaderAggregateDropdownMenuContent = () => {
  const { objectMetadataItem, onContentChange, closeDropdown } =
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

  const availableAggregations = useMemo(
    () =>
      getAvailableFieldsForAggregationFromObjectFieldss(
        objectMetadataItem.fields,
      ),
    [objectMetadataItem.fields],
  );

  const setAggregateDropdownState = useSetRecoilState(aggregateDropdownState);

  const { updateViewAggregateToCount } = useUpdateViewAggregate();

  return (
    <>
      <DropdownMenuItemsContainer>
        <MenuItem
          onClick={updateViewAggregateToCount}
          text={getAggregateOperationLabel(AGGREGATE_OPERATIONS.count)}
        />
      </DropdownMenuItemsContainer>
      {Object.entries(availableAggregations).map(
        ([
          availableAggregationOperation,
          availableAggregationFieldsIdsForOperation,
        ]) =>
          isEmpty(availableAggregationFieldsIdsForOperation) ? (
            <></>
          ) : (
            <DropdownMenuItemsContainer>
              <RecordBoardColumnHeaderAggregateDropdownMenuItem
                key={`aggregate-dropdown-menu-content-${availableAggregationOperation}`}
                onContentChange={() => {
                  setAggregateDropdownState({
                    operation:
                      availableAggregationOperation as AGGREGATE_OPERATIONS,
                    availableFieldIdsForOperation:
                      availableAggregationFieldsIdsForOperation,
                  });
                  onContentChange('aggregateFields');
                }}
                text={getAggregateOperationLabel(availableAggregationOperation)}
                hasSubMenu
              />
            </DropdownMenuItemsContainer>
          ),
      )}
    </>
  );
};
