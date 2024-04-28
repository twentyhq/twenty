import { Nullable } from 'twenty-ui';

import { RecordGqlEdge } from '@/object-record/graphql-operations/types/RecordGqlEdge';

// Todo: if possible we would like to make RecordGqlConnection<ObjectRecord> and be able to compute nested connection type
export type RecordGqlConnection = {
  __typename?: string;
  edges: RecordGqlEdge[];
  pageInfo: {
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    startCursor?: Nullable<string>;
    endCursor?: Nullable<string>;
    totalCount?: number;
  };
  totalCount?: number;
};
