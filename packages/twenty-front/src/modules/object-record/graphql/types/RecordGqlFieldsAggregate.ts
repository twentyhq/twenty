import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';

export type RecordGqlFieldsAggregate = Record<
  string,
  ExtendedAggregateOperations[]
>;
