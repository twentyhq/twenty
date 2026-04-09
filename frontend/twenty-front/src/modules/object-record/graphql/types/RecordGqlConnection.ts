import { type RecordGqlEdge } from '@/object-record/graphql/types/RecordGqlEdge';
import { type Nullable } from 'twenty-ui/utilities';

export type RecordGqlConnection = {
  __typename?: string;
  edges?: RecordGqlEdge[];
  pageInfo?: {
    __typename?: Nullable<string>;
    hasNextPage?: Nullable<boolean>;
    hasPreviousPage?: Nullable<boolean>;
    startCursor?: Nullable<string>;
    endCursor?: Nullable<string>;
    totalCount?: number;
  };
  totalCount?: number;
  [aggregateFieldName: string]: any;
};
