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
import { getAvailableFieldsIdsForAggregationFromObjectFields } from '@/object-record/utils/getAvailableFieldsIdsForAggregationFromObjectFields';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import isEmpty from 'lodash.isempty';
import { useMemo } from 'react';
import { Key } from 'ts-key-enum';
import { IconChevronLeft } from 'twenty-ui';

export const RecordBoardColumnHeaderAggregateDropdownMoreOptionsContent =
  () => {
    const { objectMetadataItem, onContentChange, closeDropdown, resetContent } =
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

    const availableAggregations: AvailableFieldsForAggregateOperation = useMemo(
      () =>
        getAvailableFieldsIdsForAggregationFromObjectFields(
          objectMetadataItem.fields,
        ),
      [objectMetadataItem.fields],
    );

    const setAggregateOperation = useSetRecoilComponentStateV2(
      aggregateOperationComponentState,
    );

    const setAvailableFieldsForAggregateOperation =
      useSetRecoilComponentStateV2(
        availableFieldIdsForAggregateOperationComponentState,
      );

    return (
      <>
        <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={resetContent}>
          More options
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
                    setAggregateOperation(
                      availableAggregationOperation as AGGREGATE_OPERATIONS,
                    );
                    setAvailableFieldsForAggregateOperation(
                      availableAggregationFieldsIdsForOperation,
                    );
                    onContentChange('aggregateFields');
                  }}
                  text={getAggregateOperationLabel(
                    availableAggregationOperation as AGGREGATE_OPERATIONS,
                  )}
                  hasSubMenu
                />
              ),
            )}
        </DropdownMenuItemsContainer>
      </>
    );
  };
