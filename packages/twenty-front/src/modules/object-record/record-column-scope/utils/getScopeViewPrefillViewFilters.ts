import { type View } from '@/views/types/View';
import { ViewFilterGroupLogicalOperator } from '@/views/types/ViewFilterGroupLogicalOperator';
import { isDefined } from 'twenty-shared/utils';

// Only conditions every scoped record must meet can prefill a new record; an OR branch is a choice, not a requirement
export const getScopeViewPrefillViewFilters = (
  scopeView: Pick<View, 'viewFilters' | 'viewFilterGroups'>,
) => {
  const andRootViewFilterGroupIds = new Set(
    (scopeView.viewFilterGroups ?? [])
      .filter(
        (viewFilterGroup) =>
          !isDefined(viewFilterGroup.parentViewFilterGroupId) &&
          viewFilterGroup.logicalOperator ===
            ViewFilterGroupLogicalOperator.AND,
      )
      .map((viewFilterGroup) => viewFilterGroup.id),
  );

  return scopeView.viewFilters.filter(
    (viewFilter) =>
      !isDefined(viewFilter.viewFilterGroupId) ||
      andRootViewFilterGroupIds.has(viewFilter.viewFilterGroupId),
  );
};
