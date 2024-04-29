import { RecordGqlOperationGqlRecordFields } from '@/object-record/graphql-operations/types/RecordGqlOperationGqlRecordFields';
import { RecordGqlOperationVariables } from '@/object-record/graphql-operations/types/RecordGqlOperationVariables';

export type RecordGqlOperationSignature = {
  objectNameSingular: string;
  variables: RecordGqlOperationVariables;
  fields?: RecordGqlOperationGqlRecordFields;
};
