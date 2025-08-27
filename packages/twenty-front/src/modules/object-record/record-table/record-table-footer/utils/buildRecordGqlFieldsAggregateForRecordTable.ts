import { type RecordGqlFieldsAggregate } from '@/object-record/graphql/types/RecordGqlFieldsAggregate';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';

export const buildRecordGqlFieldsAggregateForRecordTable = ({
  aggregateOperation,
  fieldName,
}: {
  fieldName: string;
  aggregateOperation?: AggregateOperations | null;
}): RecordGqlFieldsAggregate => {
  return {
    [fieldName]: [aggregateOperation ?? AggregateOperations.COUNT],
  };
};
