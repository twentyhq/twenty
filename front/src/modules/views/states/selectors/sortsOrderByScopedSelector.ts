import { selectorFamily } from 'recoil';

import { SortOrder } from '~/generated/graphql';

import { sortsScopedState } from '../../../ui/data/sort/states/sortsScopedState';
import { reduceSortsToOrderBy } from '../../../ui/data/view-bar/utils/helpers';

export const sortsOrderByScopedSelector = selectorFamily({
  key: 'sortsOrderByScopedSelector',
  get:
    (scopeId: string) =>
    ({ get }) => {
      const orderBy = reduceSortsToOrderBy(
        get(sortsScopedState({ scopeId: scopeId })),
      );
      return orderBy.length ? orderBy : [{ createdAt: SortOrder.Desc }];
    },
});
