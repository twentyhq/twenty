import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { QueryResultFieldValue } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-field-value';
import { IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';
import { IEdge } from 'src/engine/api/graphql/workspace-query-runner/interfaces/edge.interface';

export const isQueryResultFieldValueAConnection = (
  result: QueryResultFieldValue,
): result is IConnection<ObjectRecord, IEdge<ObjectRecord>> => {
  return 'edges' in result && Array.isArray(result.edges);
};
