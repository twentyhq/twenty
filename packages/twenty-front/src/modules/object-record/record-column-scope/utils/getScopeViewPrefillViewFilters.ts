import { type View } from '@/views/types/View';
import { ViewFilterGroupLogicalOperator } from '@/views/types/ViewFilterGroupLogicalOperator';
import { isDefined } from 'twenty-shared/utils';

// Only conditions every scoped record must meet can prefill a new record; an OR branch is a choice, not a requirement
export const getScopeViewPrefillViewFilters = (
  scopeView: Pick<View, 'viewFilters' | 'viewFilterGroups'>,
) => {
  const viewFilterGroupById = new Map(
    (scopeView.viewFilterGroups ?? []).map((viewFilterGroup) => [
      viewFilterGroup.id,
      viewFilterGroup,
    ]),
  );

  const isRequiredViewFilterGroup = (viewFilterGroupId: string): boolean => {
    const viewFilterGroup = viewFilterGroupById.get(viewFilterGroupId);

    if (
      !isDefined(viewFilterGroup) ||
      viewFilterGroup.logicalOperator !== ViewFilterGroupLogicalOperator.AND
    ) {
      return false;
    }

    return (
      !isDefined(viewFilterGroup.parentViewFilterGroupId) ||
      isRequiredViewFilterGroup(viewFilterGroup.parentViewFilterGroupId)
    );
  };

  return scopeView.viewFilters.filter(
    (viewFilter) =>
      !isDefined(viewFilter.viewFilterGroupId) ||
      isRequiredViewFilterGroup(viewFilter.viewFilterGroupId),
  );
};
