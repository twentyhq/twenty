import { ObjectRecordQueryVariables } from '@/object-record/types/ObjectRecordQueryVariables';

export type QueryKey = {
  objectNameSingular: string;
  variables: ObjectRecordQueryVariables;
  depth: number;
};
