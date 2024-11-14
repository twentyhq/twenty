import { Record as ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { QueryResultFieldValue } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-field-value';

export const isQueryResultFieldValueARecordArray = (
  result: QueryResultFieldValue,
): result is ObjectRecord[] => {
  return Array.isArray(result);
};
