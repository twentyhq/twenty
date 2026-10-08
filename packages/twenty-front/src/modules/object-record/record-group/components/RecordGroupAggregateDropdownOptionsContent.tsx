import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { RecordGroupAggregateDropdownMenuItem } from '@/object-record/record-group/components/RecordGroupAggregateDropdownMenuItem';
import { RECORD_GROUP_AGGREGATE_FIELDS_PAGE_ID } from '@/object-record/record-group/constants/RecordGroupAggregateFieldsPageId';
import { aggregateOperationComponentState } from '@/object-record/record-group/states/aggregateOperationComponentState';
import { availableFieldIdsForAggregateOperationComponentState } from '@/object-record/record-group/states/availableFieldIdsForAggregateOperationComponentState';
import { recordIndexGroupAggregateOperationComponentState } from '@/object-record/record-index/states/recordIndexGroupAggregateOperationComponentState';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { type AvailableFieldsForAggregateOperation } from '@/object-record/types/AvailableFieldsForAggregateOperation';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useUpdateViewAggregate } from '@/views/hooks/useUpdateViewAggregate';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconCheck } from 'twenty-ui/icon';

type RecordGroupAggregateDropdownOptionsContentProps = {
  availableAggregations: AvailableFieldsForAggregateOperation;
  title: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
};

export const RecordGroupAggregateDropdownOptionsContent = ({
  availableAggregations,
  title,
  objectMetadataItem,
}: RecordGroupAggregateDropdownOptionsContentProps) => {
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
    <>
      <Dropdown.Back>{title}</Dropdown.Back>
      <Dropdown.Section>
        {Object.entries(availableAggregations)
          .filter(([, fields]) => isNonEmptyArray(fields))
          .map(
            ([
              availableAggregationOperation,
              availableAggregationFieldsIdsForOperation,
            ]) => {
              const aggregateOperation =
                availableAggregationOperation as ExtendedAggregateOperations;
              const isCountOperation =
                aggregateOperation === AggregateOperations.COUNT;

              return (
                <RecordGroupAggregateDropdownMenuItem
                  key={aggregateOperation}
                  onClick={() => {
                    if (isCountOperation) {
                      updateViewAggregate({
                        kanbanAggregateOperationFieldMetadataId:
                          availableAggregationFieldsIdsForOperation[0],
                        kanbanAggregateOperation: aggregateOperation,
                        objectMetadataItem,
                      });
                      return;
                    }

                    setAggregateOperation(aggregateOperation);
                    setAvailableFieldIdsForAggregateOperation(
                      availableAggregationFieldsIdsForOperation,
                    );
                  }}
                  text={getAggregateOperationLabel(aggregateOperation)}
                  page={
                    isCountOperation
                      ? undefined
                      : RECORD_GROUP_AGGREGATE_FIELDS_PAGE_ID
                  }
                  RightIcon={
                    isCountOperation &&
                    recordIndexGroupAggregateOperation ===
                      AggregateOperations.COUNT
                      ? IconCheck
                      : undefined
                  }
                />
              );
            },
          )}
      </Dropdown.Section>
    </>
  );
};
