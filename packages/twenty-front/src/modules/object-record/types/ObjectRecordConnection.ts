import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordEdge } from '@/object-record/types/ObjectRecordEdge';

export type ObjectRecordConnection<T extends ObjectRecord = ObjectRecord> = {
  __typename?: string;
  edges: ObjectRecordEdge<T>[];
  pageInfo: {
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    startCursor?: string;
    endCursor?: string;
  };
};
