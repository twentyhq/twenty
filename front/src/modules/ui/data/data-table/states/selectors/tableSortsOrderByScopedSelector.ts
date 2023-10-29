import { selectorFamily } from 'recoil';

import { reduceSortsToOrderBy } from '@/ui/data/sort/utils/helpers';
import { SortOrder } from '~/generated/graphql';

import { tableSortsScopedState } from '../tableSortsScopedState';

export const tableSortsOrderByScopedSelector = selectorFamily({
  key: 'tableSortsOrderByScopedSelector',
  get:
    (scopeId: string) =>
    ({ get }) => {
      const orderBy = reduceSortsToOrderBy(get(tableSortsScopedState(scopeId)));
      return orderBy.length ? orderBy : [{ createdAt: SortOrder.Desc }];
    },
});
