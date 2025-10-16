import { type ObjectRecord } from 'twenty-shared/types';

import { type QueryResultFieldValue } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-field-value';

export const isQueryResultFieldValueARecord = (
  result: QueryResultFieldValue,
): result is ObjectRecord => {
  return 'id' in result;
};
