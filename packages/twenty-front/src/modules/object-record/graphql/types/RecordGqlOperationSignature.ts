import { type RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { type RecordGqlOperationVariables } from '@/object-record/graphql/types/RecordGqlOperationVariables';

export type RecordGqlOperationSignature = {
  objectNameSingular: string;
  variables: RecordGqlOperationVariables;
  fields?: RecordGqlOperationGqlRecordFields;
};
