import { Nullable } from 'twenty-ui';

import { RecordGqlEdge } from '@/object-record/graphql/types/RecordGqlEdge';

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
