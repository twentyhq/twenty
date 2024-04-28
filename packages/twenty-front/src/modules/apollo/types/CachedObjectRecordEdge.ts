import { Reference } from '@apollo/client';

import { RecordGqlEdge } from '@/object-record/graphql-operations/types/RecordGqlEdge';

export type CachedObjectRecordEdge = Omit<RecordGqlEdge, 'node'> & {
  node: Reference;
};
