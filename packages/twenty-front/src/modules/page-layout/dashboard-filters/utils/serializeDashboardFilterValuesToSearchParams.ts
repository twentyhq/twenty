import { DASHBOARD_FILTER_URL_QUERY_PARAM_KEY } from '@/page-layout/dashboard-filters/constants/DashboardFilterUrlQueryParamKey';
import { type DashboardFilterValues } from '@/page-layout/dashboard-filters/types/DashboardFilterValues';
import { isDefined } from 'twenty-shared/utils';

// Rewrites only the dashboardFilter[...] params and leaves every other query param untouched.
export const serializeDashboardFilterValuesToSearchParams = ({
  searchParams,
  values,
}: {
  searchParams: URLSearchParams;
  values: DashboardFilterValues;
}): URLSearchParams => {
  const nextSearchParams = new URLSearchParams(searchParams);

  for (const key of Array.from(nextSearchParams.keys())) {
    if (key.startsWith(`${DASHBOARD_FILTER_URL_QUERY_PARAM_KEY}[`)) {
      nextSearchParams.delete(key);
    }
  }

  for (const [slotId, value] of Object.entries(values)) {
    if (!isDefined(value)) {
      continue;
    }

    nextSearchParams.set(
      `${DASHBOARD_FILTER_URL_QUERY_PARAM_KEY}[${slotId}][operand]`,
      value.operand,
    );
    nextSearchParams.set(
      `${DASHBOARD_FILTER_URL_QUERY_PARAM_KEY}[${slotId}][value]`,
      value.value,
    );
  }

  return nextSearchParams;
};
