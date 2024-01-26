import { Reference } from '@apollo/client';

import { ObjectRecordEdge } from '@/object-record/types/ObjectRecordEdge';

export type CachedObjectRecordEdge = Omit<ObjectRecordEdge, 'node'> & {
  node: Reference;
};
