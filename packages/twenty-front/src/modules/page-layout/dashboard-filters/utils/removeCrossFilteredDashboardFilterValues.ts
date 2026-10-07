import { isDashboardFilterSlotCrossFiltered } from '@/page-layout/dashboard-filters/utils/isDashboardFilterSlotCrossFiltered';
import { type DashboardFilterValue } from 'twenty-shared/types';
import { removePropertiesFromRecord } from 'twenty-shared/utils';

// A slot whose value changed since the chart set it was taken over by the viewer, so it stays.
export const removeCrossFilteredDashboardFilterValues = ({
  dashboardFilterValues,
  dashboardFilterCrossFilterValues,
}: {
  dashboardFilterValues: Record<string, DashboardFilterValue | undefined>;
  dashboardFilterCrossFilterValues: Record<string, DashboardFilterValue>;
}): Record<string, DashboardFilterValue | undefined> => {
  const crossFilteredSlotIds = Object.keys(
    dashboardFilterCrossFilterValues,
  ).filter((slotId) =>
    isDashboardFilterSlotCrossFiltered({
      slotId,
      dashboardFilterValues,
      dashboardFilterCrossFilterValues,
    }),
  );

  if (crossFilteredSlotIds.length === 0) {
    return dashboardFilterValues;
  }

  return removePropertiesFromRecord(
    dashboardFilterValues,
    crossFilteredSlotIds,
  );
};
