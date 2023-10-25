import { selectorFamily } from 'recoil';

import { SortOrder } from '~/generated/graphql';

import { reduceSortsToOrderBy } from '../../../ui/data/view-bar/utils/helpers';
import { sortsScopedFamilyState } from '../sortsScopedFamilyState';

export const sortsOrderByScopedSelector = selectorFamily({
  key: 'sortsOrderByScopedSelector',
  get:
    ({ viewScopeId, viewId }: { viewScopeId: string; viewId: string }) =>
    ({ get }) => {
      const orderBy = reduceSortsToOrderBy(
        get(
          sortsScopedFamilyState({ scopeId: viewScopeId, familyKey: viewId }),
        ),
      );
      return orderBy.length ? orderBy : [{ createdAt: SortOrder.Desc }];
    },
});
