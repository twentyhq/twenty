import { RecordGqlOperationVariables } from '@/object-record/graphql/types/RecordGqlOperationVariables';

export const getQueryIdentifier = ({
  objectNameSingular,
  filter,
  orderBy,
  limit,
  cursorFilter,
}: RecordGqlOperationVariables & {
  objectNameSingular: string;
}) =>
  objectNameSingular +
  JSON.stringify(filter) +
  JSON.stringify(orderBy) +
  limit +
  (cursorFilter ? JSON.stringify(cursorFilter) : undefined);
