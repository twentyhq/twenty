import { ObjectRecordQueryVariables } from '@/object-record/types/ObjectRecordQueryVariables';

export type QueryKey = {
  objectNameSingular: string;
  variables: ObjectRecordQueryVariables;
  depth?: number;
  fields?: Record<string, any>; // Todo: Fields should be required
  fieldsFactory?: (fieldsFactoryParam: any) => Record<string, any>;
};
