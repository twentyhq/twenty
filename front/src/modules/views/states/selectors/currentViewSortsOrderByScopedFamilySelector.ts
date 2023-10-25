import { selectorFamily } from 'recoil';

import { reduceSortsToOrderBy } from '@/ui/data/sort/utils/helpers';
import { SortOrder } from '~/generated/graphql';

import { currentViewSortsScopedFamilyState } from '../currentViewSortsScopedFamilyState';

export const currentViewSortsOrderByScopedFamilySelector = selectorFamily({
  key: 'currentViewSortsOrderByScopedFamilySelector',
  get:
    ({ viewScopeId, viewId }: { viewScopeId: string; viewId?: string }) =>
    ({ get }) => {
      if (!viewId) {
        return;
      }
      const orderBy = reduceSortsToOrderBy(
        get(
          currentViewSortsScopedFamilyState({
            scopeId: viewScopeId,
            familyKey: viewId,
          }),
        ),
      );
      return orderBy.length ? orderBy : [{ createdAt: SortOrder.Desc }];
    },
});
