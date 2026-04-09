import { type RecordGqlConnection } from '@/object-record/graphql/types/RecordGqlConnection';

export type RecordGqlGroupByConnection = RecordGqlConnection & {
  groupByDimensionValues: string[];
};

export type RecordGqlOperationGroupByResult = {
  [objectNamePlural: string]: RecordGqlGroupByConnection[];
};
