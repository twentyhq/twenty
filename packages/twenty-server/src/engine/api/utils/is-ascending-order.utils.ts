import { OrderByDirection } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

export const isAscendingOrder = (direction: OrderByDirection): boolean =>
  direction === OrderByDirection.AscNullsFirst ||
  direction === OrderByDirection.AscNullsLast;
