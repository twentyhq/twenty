import { selectorFamily } from 'recoil';

import { SortOrder } from '~/generated/graphql';

import { reduceSortsToOrderBy } from '../../components/view-bar/utils/helpers';
import { currentViewSortsScopedFamilyState } from '../currentViewSortsScopedFamilyState';

export const currentViewSortsOrderByScopedFamilySelector = selectorFamily({
  key: 'currentViewSortsOrderByScopedFamilySelector',
  get:
    ({ viewScopeId, viewId }: { viewScopeId: string; viewId: string }) =>
    ({ get }) => {
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
