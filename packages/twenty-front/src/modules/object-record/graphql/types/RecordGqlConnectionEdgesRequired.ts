import { type RecordGqlConnection } from '@/object-record/graphql/types/RecordGqlConnection';

export type RecordGqlConnectionEdgesRequired = Omit<
  RecordGqlConnection,
  'edges'
> &
  Required<Pick<RecordGqlConnection, 'edges'>>;
