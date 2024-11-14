import { isDefined } from 'class-validator';

import { Record as ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';
import { IEdge } from 'src/engine/api/graphql/workspace-query-runner/interfaces/edge.interface';

import { PossibleQueryResultFieldValue } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/query-result-getters.factory';

export const isPossibleFieldValueAConnection = (
  result: PossibleQueryResultFieldValue,
): result is IConnection<ObjectRecord, IEdge<ObjectRecord>> => {
  return isDefined((result as any).edges);
};

export const isPossibleFieldValueANestedRecordArray = (
  result: PossibleQueryResultFieldValue,
): result is { records: ObjectRecord[] } => {
  return 'records' in result && Array.isArray(result.records);
};

export const isPossibleFieldValueARecordArray = (
  result: PossibleQueryResultFieldValue,
): result is ObjectRecord[] => {
  return Array.isArray(result);
};
