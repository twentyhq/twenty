import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export type CachedObjectRecord<T extends ObjectRecord = ObjectRecord> = T & {
  __typename: string;
};
