import { Reference } from '@apollo/client';

import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordEdge } from '@/object-record/types/ObjectRecordEdge';

export type CachedObjectRecordEdge<T extends ObjectRecord = ObjectRecord> =
  Omit<ObjectRecordEdge<T>, 'node'> & {
    node: Reference;
  };
