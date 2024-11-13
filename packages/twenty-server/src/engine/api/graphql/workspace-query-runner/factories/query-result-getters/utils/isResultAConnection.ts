import { isDefined } from 'class-validator';

import { Record as ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';
import { IEdge } from 'src/engine/api/graphql/workspace-query-runner/interfaces/edge.interface';

import { PossibleFieldValue } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/query-result-getters.factory';

export const isPossibleFieldValueAConnection = (
  result: PossibleFieldValue,
): result is IConnection<ObjectRecord, IEdge<ObjectRecord>> => {
  return isDefined((result as any).edges);
};

export const isPossibleFieldValueARecordArray = (
  result: PossibleFieldValue,
): result is { records: ObjectRecord[] } => {
  return Array.isArray((result as any).records);
};

export const isPossibleFieldValueARecord = (
  result: PossibleFieldValue,
): result is ObjectRecord => {
  return (
    !isPossibleFieldValueAConnection(result) &&
    !isPossibleFieldValueARecordArray(result)
  );
};
