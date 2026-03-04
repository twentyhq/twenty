import { type ChartFilters } from '@/command-menu/pages/page-layout/types/ChartFilters';
import { isDefined } from 'twenty-shared/utils';

export const getChartFilterRulesCount = (
  filter: ChartFilters | undefined,
): number => {
  if (!isDefined(filter)) {
    return 0;
  }

  const recordFilters = filter.recordFilters ?? [];
  const recordFilterGroups = filter.recordFilterGroups ?? [];

  const rootGroup = recordFilterGroups.find(
    (group) => !isDefined(group.parentRecordFilterGroupId),
  );

  if (!isDefined(rootGroup)) {
    return 0;
  }

  const childFiltersCount = recordFilters.filter(
    (recordFilter) => recordFilter.recordFilterGroupId === rootGroup.id,
  ).length;

  const childGroupsCount = recordFilterGroups.filter(
    (group) => group.parentRecordFilterGroupId === rootGroup.id,
  ).length;

  return childFiltersCount + childGroupsCount;
};
