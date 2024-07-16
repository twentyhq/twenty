import { RecordGqlOperationVariables } from '@/object-record/graphql/types/RecordGqlOperationVariables';

export const getQueryIdentifier = ({
  objectNameSingular,
  filter,
  orderBy,
  limit,
}: RecordGqlOperationVariables & {
  objectNameSingular: string;
}) =>
  objectNameSingular + JSON.stringify(filter) + JSON.stringify(orderBy) + limit;
