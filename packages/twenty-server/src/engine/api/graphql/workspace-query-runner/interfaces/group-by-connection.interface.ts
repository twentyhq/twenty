import { type IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';
import { type IEdge } from 'src/engine/api/graphql/workspace-query-runner/interfaces/edge.interface';

export type IGroupByConnection<
  T,
  CustomEdge extends IEdge<T> = IEdge<T>,
> = IConnection<T, CustomEdge> & {
  groupByDimensionValues: string[];
};
