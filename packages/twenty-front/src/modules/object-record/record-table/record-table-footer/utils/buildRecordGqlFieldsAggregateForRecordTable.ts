import { RecordGqlFieldsAggregate } from '@/object-record/graphql/types/RecordGqlFieldsAggregate';
import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';

export const buildRecordGqlFieldsAggregateForRecordTable = ({
  aggregateOperation,
  fieldName,
}: {
  fieldName: string;
  aggregateOperation?: AGGREGATE_OPERATIONS | null;
}): RecordGqlFieldsAggregate => {
  return {
    [fieldName]: [aggregateOperation ?? AGGREGATE_OPERATIONS.count],
  };
};
