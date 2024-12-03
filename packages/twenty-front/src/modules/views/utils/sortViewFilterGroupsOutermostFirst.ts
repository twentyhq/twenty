import { ViewFilterGroup } from '@/views/types/ViewFilterGroup';

export const sortViewFilterGroupsOutermostFirst = (
  viewFilterGroups: ViewFilterGroup[],
  parentViewFilterGroupId?: string,
): ViewFilterGroup[] => {
  const childGroups = viewFilterGroups.filter(
    (group) => group.parentViewFilterGroupId === parentViewFilterGroupId,
  );

  return childGroups.flatMap((group) => [
    group,
    ...sortViewFilterGroupsOutermostFirst(viewFilterGroups, group.id),
  ]);
};
