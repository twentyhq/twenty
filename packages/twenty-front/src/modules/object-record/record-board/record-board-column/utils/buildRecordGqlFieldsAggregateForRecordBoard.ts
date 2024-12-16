import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordGqlFieldsAggregate } from '@/object-record/graphql/types/RecordGqlFieldsAggregate';
import { KanbanAggregateOperation } from '@/object-record/record-index/states/recordIndexKanbanAggregateOperationState';
import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { isDefined } from '~/utils/isDefined';

export const buildRecordGqlFieldsAggregateForRecordBoard = ({
  objectMetadataItem,
  recordIndexKanbanAggregateOperation,
  kanbanFieldName,
}: {
  objectMetadataItem: ObjectMetadataItem;
  recordIndexKanbanAggregateOperation: KanbanAggregateOperation;
  kanbanFieldName: string;
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
        [kanbanFieldName]: [AGGREGATE_OPERATIONS.count],
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
