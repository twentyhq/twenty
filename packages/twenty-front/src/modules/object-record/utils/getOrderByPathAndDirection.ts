import {
  type OrderBy,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { isOrderByDirection } from '@/object-record/graphql/utils/isOrderByDirection';

export const getOrderByPathAndDirection = (
  orderBy: RecordGqlOperationOrderBy,
): { path: string[]; direction: OrderBy } | null => {
  const path: string[] = [];
  let current: unknown = orderBy[0];

  while (isPlainObject(current)) {
    const firstEntry = Object.entries(current)[0];

    if (!isDefined(firstEntry)) {
      return null;
    }

    const [key, value] = firstEntry;

    path.push(key);
    current = value;
  }

  return isOrderByDirection(current) ? { path, direction: current } : null;
};
