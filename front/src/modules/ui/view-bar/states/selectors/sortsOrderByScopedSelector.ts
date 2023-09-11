import { selectorFamily } from 'recoil';

import { SortOrder } from '~/generated/graphql';

import { reduceSortsToOrderBy } from '../../helpers';
import { sortsScopedState } from '../sortsScopedState';

export const sortsOrderByScopedSelector = selectorFamily({
  key: 'sortsOrderByScopedSelector',
  get:
    (scopeId: string) =>
    ({ get }) => {
      const orderBy = reduceSortsToOrderBy(get(sortsScopedState(scopeId)));
      return orderBy.length ? orderBy : [{ createdAt: SortOrder.Desc }];
    },
});
