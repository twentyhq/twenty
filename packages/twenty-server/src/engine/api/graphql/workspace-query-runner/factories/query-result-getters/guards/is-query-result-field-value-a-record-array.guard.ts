import { type ObjectRecord } from 'twenty-shared/types';

import { type QueryResultFieldValue } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-field-value';

import { type CommonQueryResult } from 'src/engine/api/common/types/common-query-result.type';

export const isQueryResultFieldValueARecordArray = (
  result: QueryResultFieldValue | CommonQueryResult,
): result is ObjectRecord[] => {
  return Array.isArray(result);
};
