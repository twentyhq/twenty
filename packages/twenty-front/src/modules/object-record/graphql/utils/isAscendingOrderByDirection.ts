import { type OrderBy } from 'twenty-shared/types';

export const isAscendingOrderByDirection = (direction: OrderBy): boolean =>
  direction === 'AscNullsFirst' || direction === 'AscNullsLast';
