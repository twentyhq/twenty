import { OrderBy } from '@/types/OrderBy';
import { assertUnreachable } from 'twenty-shared/utils';

export const turnOrderByIntoSort = (orderBy: OrderBy): 'asc' | 'desc' => {
  if (orderBy === 'AscNullsFirst' || orderBy === 'AscNullsLast') {
    return 'asc';
  } else if (orderBy === 'DescNullsFirst' || orderBy === 'DescNullsLast') {
    return 'desc';
  } else {
    assertUnreachable(orderBy);
  }
};
