import { QueryFields } from '@/object-record/query-keys/types/QueryFields';
import { ObjectRecordQueryVariables } from '@/object-record/types/ObjectRecordQueryVariables';

export type QueryKey = {
  objectNameSingular: string;
  variables: ObjectRecordQueryVariables;
  depth?: number;
  fields?: QueryFields; // Todo: Fields should be required
  fieldsFactory?: (fieldsFactoryParam: any) => QueryFields;
};
