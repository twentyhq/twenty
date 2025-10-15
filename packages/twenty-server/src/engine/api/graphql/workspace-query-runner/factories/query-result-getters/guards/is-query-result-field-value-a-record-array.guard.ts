import { type ObjectRecord } from 'twenty-shared/types';

import { type QueryResultFieldValue } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-field-value';

export const isQueryResultFieldValueARecordArray = (
  result: QueryResultFieldValue,
): result is ObjectRecord[] => {
  return Array.isArray(result);
};
