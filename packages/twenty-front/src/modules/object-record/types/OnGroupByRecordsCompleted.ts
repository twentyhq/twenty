import { type RecordGqlConnection } from '@/object-record/graphql/types/RecordGqlConnection';

export type OnGroupByRecordsCompleted<T> = (
  records: T[],
  options?: {
    groupByDimensionValues?: string[];
    pageInfo?: RecordGqlConnection['pageInfo'];
    totalCount?: number;
  },
) => void;
