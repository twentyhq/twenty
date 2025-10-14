import {
  type ObjectRecordOrderBy,
  OrderByDirection,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

export const addDefaultOrderById = (orderBy: ObjectRecordOrderBy) => {
  const hasIdOrder = orderBy.some((o) => Object.keys(o).includes('id'));

  return hasIdOrder
    ? orderBy
    : [...orderBy, { id: OrderByDirection.AscNullsFirst }];
};
