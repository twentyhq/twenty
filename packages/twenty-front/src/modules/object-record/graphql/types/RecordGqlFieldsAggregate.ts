import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';

// A key is a field name, or `relationFieldName.targetFieldName` to aggregate a
// field of the many-to-one related object.
export type RecordGqlFieldsAggregate = Record<
  string,
  ExtendedAggregateOperations[]
>;
