import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export type CachedObjectRecord = ObjectRecord & { __typename: string };
