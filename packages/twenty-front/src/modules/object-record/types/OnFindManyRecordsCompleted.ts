import { type RecordGqlConnection } from '@/object-record/graphql/types/RecordGqlConnection';

export type OnFindManyRecordsCompleted<T> = (
  records: T[],
  options?: {
    pageInfo?: RecordGqlConnection['pageInfo'];
    totalCount?: number;
  },
) => void;
