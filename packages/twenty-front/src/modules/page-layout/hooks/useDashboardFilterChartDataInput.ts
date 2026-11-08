import { useDashboardFilterForWidget } from '@/page-layout/hooks/useDashboardFilterForWidget';
import { useDashboardFilters } from '@/page-layout/hooks/useDashboardFilters';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { buildDashboardFilterChartDataInput } from '@/page-layout/utils/buildDashboardFilterChartDataInput';
import { isDefined } from 'twenty-shared/utils';

export const useDashboardFilterChartDataInput = (
  widget: Pick<PageLayoutWidget, 'objectMetadataId' | 'configuration'>,
) => {
  const dashboardFilters = useDashboardFilters();
  const { boundDashboardFilterValues } = useDashboardFilterForWidget(widget);

  return isDefined(dashboardFilters)
    ? buildDashboardFilterChartDataInput({
        boundDashboardFilterValues,
        viewerTimeZone: dashboardFilters.timeZone,
      })
    : {};
};
