import { DEFAULT_ID_ORDER_BY_TIEBREAKER } from 'src/engine/api/common/constants/default-id-order-by-tiebreaker.constant';
import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

export const addDefaultOrderById = (orderBy: ObjectRecordOrderBy) => {
  const hasIdOrder = orderBy.some((o) => Object.keys(o).includes('id'));

  return hasIdOrder ? orderBy : [...orderBy, DEFAULT_ID_ORDER_BY_TIEBREAKER];
};
