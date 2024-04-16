import { Nullable } from 'twenty-ui';

import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordEdge } from '@/object-record/types/ObjectRecordEdge';

export type ObjectRecordConnection<T extends ObjectRecord = ObjectRecord> = {
  __typename?: string;
  edges: ObjectRecordEdge<T>[];
  pageInfo: {
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    startCursor?: Nullable<string>;
    endCursor?: Nullable<string>;
    totalCount?: number;
  };
  totalCount?: number;
};
