import { RecordGqlOperationFields } from '@/object-record/graphql-operations/types/RecordGqlOperationFields';
import { RecordGqlOperationVariables } from '@/object-record/graphql-operations/types/RecordGqlOperationVariables';

export type RecordGqlOperationSignature = {
  objectNameSingular: string;
  variables: RecordGqlOperationVariables;
  fields?: RecordGqlOperationFields;
};
