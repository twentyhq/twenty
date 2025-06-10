import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordGqlFieldsAggregate } from '@/object-record/graphql/types/RecordGqlFieldsAggregate';
import { KanbanAggregateOperation } from '@/object-record/record-index/states/recordIndexKanbanAggregateOperationState';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { FIELD_FOR_TOTAL_COUNT_AGGREGATE_OPERATION } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

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
        AggregateOperations.COUNT
    ) {
      throw new Error(
        `No field found to compute aggregate operation ${recordIndexKanbanAggregateOperation.operation} on object ${objectMetadataItem.nameSingular}`,
      );
    } else {
      recordGqlFieldsAggregate = {
        [FIELD_FOR_TOTAL_COUNT_AGGREGATE_OPERATION]: [
          AggregateOperations.COUNT,
        ],
      };
    }
  } else {
    recordGqlFieldsAggregate = {
      [kanbanAggregateOperationFieldName]: [
        recordIndexKanbanAggregateOperation?.operation ??
          AggregateOperations.COUNT,
      ],
    };
  }

  return recordGqlFieldsAggregate;
};
