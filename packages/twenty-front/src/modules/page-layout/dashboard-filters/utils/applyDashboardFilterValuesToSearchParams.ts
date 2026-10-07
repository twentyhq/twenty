import { DASHBOARD_FILTER_URL_QUERY_PARAM_KEY } from '@/page-layout/dashboard-filters/constants/DashboardFilterUrlQueryParamKey';
import { type DashboardFilterValue } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const applyDashboardFilterValuesToSearchParams = ({
  searchParams,
  dashboardFilterValues,
}: {
  searchParams: URLSearchParams;
  dashboardFilterValues: Record<string, DashboardFilterValue | undefined>;
}): URLSearchParams => {
  const nextSearchParams = new URLSearchParams(searchParams);

  Array.from(nextSearchParams.keys())
    .filter((key) => key.startsWith(`${DASHBOARD_FILTER_URL_QUERY_PARAM_KEY}[`))
    .forEach((key) => nextSearchParams.delete(key));

  Object.entries(dashboardFilterValues).forEach(([slotId, value]) => {
    if (!isDefined(value)) {
      return;
    }

    nextSearchParams.set(
      `${DASHBOARD_FILTER_URL_QUERY_PARAM_KEY}[${slotId}][operand]`,
      value.operand,
    );
    nextSearchParams.set(
      `${DASHBOARD_FILTER_URL_QUERY_PARAM_KEY}[${slotId}][value]`,
      value.value,
    );
  });

  return nextSearchParams;
};
