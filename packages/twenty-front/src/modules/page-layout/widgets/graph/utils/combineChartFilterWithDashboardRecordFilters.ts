import { type DashboardDrilldownRecordFilter } from '@/page-layout/widgets/graph/types/DashboardDrilldownRecordFilter';
import { type ChartFilters } from '@/side-panel/pages/page-layout/types/ChartFilters';
import { RecordFilterGroupLogicalOperator } from 'twenty-shared/types';
import {
  findRootRecordFilterGroup,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';

const DASHBOARD_ROOT_RECORD_FILTER_GROUP_ID = 'dashboard-filter-root';

// Groups everything under one AND root so dashboard conditions never share a
// `filter[field][operand]` URL key with the clicked bucket's conditions.
export const combineChartFilterWithDashboardRecordFilters = ({
  chartFilter: { recordFilters = [], recordFilterGroups = [] },
  dashboardRecordFilters,
}: {
  chartFilter: ChartFilters;
  dashboardRecordFilters: DashboardDrilldownRecordFilter[];
}): Required<ChartFilters> => {
  if (!isNonEmptyArray(dashboardRecordFilters)) {
    return { recordFilters, recordFilterGroups };
  }

  const getGroupTreeIds = (recordFilterGroupId: string): string[] => [
    recordFilterGroupId,
    ...recordFilterGroups
      .filter(
        ({ parentRecordFilterGroupId }) =>
          parentRecordFilterGroupId === recordFilterGroupId,
      )
      .flatMap(({ id }) => getGroupTreeIds(id)),
  ];

  const rootRecordFilterGroup = findRootRecordFilterGroup(recordFilterGroups);

  // The chart compiles its first parentless group only, so the others stay out of the drilldown too
  const appliedRecordFilterGroupIds = new Set(
    isDefined(rootRecordFilterGroup)
      ? getGroupTreeIds(rootRecordFilterGroup.id)
      : [],
  );

  return {
    recordFilterGroups: [
      {
        id: DASHBOARD_ROOT_RECORD_FILTER_GROUP_ID,
        logicalOperator: RecordFilterGroupLogicalOperator.AND,
      },
      ...recordFilterGroups
        .filter(({ id }) => appliedRecordFilterGroupIds.has(id))
        .map((recordFilterGroup) => ({
          ...recordFilterGroup,
          parentRecordFilterGroupId:
            recordFilterGroup.parentRecordFilterGroupId ??
            DASHBOARD_ROOT_RECORD_FILTER_GROUP_ID,
        })),
    ],
    recordFilters: [
      ...recordFilters
        .filter(
          ({ recordFilterGroupId }) =>
            !isDefined(recordFilterGroupId) ||
            appliedRecordFilterGroupIds.has(recordFilterGroupId),
        )
        .map((recordFilter) => ({
          ...recordFilter,
          recordFilterGroupId:
            recordFilter.recordFilterGroupId ??
            DASHBOARD_ROOT_RECORD_FILTER_GROUP_ID,
        })),
      ...dashboardRecordFilters.map(({ fieldMetadataId, operand, value }) => ({
        fieldMetadataId,
        operand,
        value,
        recordFilterGroupId: DASHBOARD_ROOT_RECORD_FILTER_GROUP_ID,
      })),
    ],
  };
};
