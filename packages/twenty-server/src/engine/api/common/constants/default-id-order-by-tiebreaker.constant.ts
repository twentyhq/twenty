import { OrderByDirection } from 'twenty-shared/types';

// NULLS LAST matches the primary-key index order, so the planner can walk it and stop at LIMIT instead of sorting every row past the cursor
export const DEFAULT_ID_ORDER_BY_TIEBREAKER = {
  id: OrderByDirection.AscNullsLast,
};
