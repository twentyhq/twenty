import { ObjectRecordQueryVariables } from '@/object-record/types/ObjectRecordQueryVariables';

export type CachedObjectRecordQueryVariables = Omit<
  ObjectRecordQueryVariables,
  'limit'
> & { first?: ObjectRecordQueryVariables['limit'] };
