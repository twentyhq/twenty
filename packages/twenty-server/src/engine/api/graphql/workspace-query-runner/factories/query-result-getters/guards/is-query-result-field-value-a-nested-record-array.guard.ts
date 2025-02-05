import { ObjectRecord } from 'twenty-shared';

import { QueryResultFieldValue } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-field-value';

export const isQueryResultFieldValueANestedRecordArray = (
  result: QueryResultFieldValue,
): result is { records: ObjectRecord[] } => {
  return 'records' in result && Array.isArray(result.records);
};
