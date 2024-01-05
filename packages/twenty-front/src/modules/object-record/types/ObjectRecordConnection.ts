import { ObjectRecordEdge } from '@/object-record/types/ObjectRecordEdge';

export type ObjectRecordConnection = {
  edges: ObjectRecordEdge[];
  pageInfo: {
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    startCursor?: string;
    endCursor?: string;
  };
};
