import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordGqlFieldsAggregate } from '@/object-record/graphql/types/RecordGqlFieldsAggregate';
import { KanbanAggregateOperation } from '@/object-record/record-index/states/recordIndexKanbanAggregateOperationState';
import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import {
  FIELD_FOR_TOTAL_COUNT_AGGREGATE_OPERATION,
  isDefined,
} from 'twenty-shared';

export const buildRecordGqlFieldsAggregateForView = ({
  objectMetadataItem,
  recordIndexKanbanAggregateOperation,
}: {
  objectMetadataItem: ObjectMetadataItem;
  recordIndexKanbanAggregateOperation: KanbanAggregateOperation;
}): RecordGqlFieldsAggregate => {
  let recordGqlFieldsAggregate = {};

  const kanbanAggregateOperationFieldName = objectMetadataItem.fields?.find(
    (field) =>
      field.id === recordIndexKanbanAggregateOperation?.fieldMetadataId,
  )?.name;

  if (!kanbanAggregateOperationFieldName) {
    if (
      isDefined(recordIndexKanbanAggregateOperation?.operation) &&
      recordIndexKanbanAggregateOperation.operation !==
        AGGREGATE_OPERATIONS.count
    ) {
      throw new Error(
        `No field found to compute aggregate operation ${recordIndexKanbanAggregateOperation.operation} on object ${objectMetadataItem.nameSingular}`,
      );
    } else {
      recordGqlFieldsAggregate = {
        [FIELD_FOR_TOTAL_COUNT_AGGREGATE_OPERATION]: [
          AGGREGATE_OPERATIONS.count,
        ],
      };
    }
  } else {
    recordGqlFieldsAggregate = {
      [kanbanAggregateOperationFieldName]: [
        recordIndexKanbanAggregateOperation?.operation ??
          AGGREGATE_OPERATIONS.count,
      ],
    };
  }

  return recordGqlFieldsAggregate;
};
