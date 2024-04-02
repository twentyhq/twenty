import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordEdge } from '@/object-record/types/ObjectRecordEdge';
import { Nullable } from '~/types/Nullable';

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
