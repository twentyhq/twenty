import { DASHBOARD_FILTER_URL_QUERY_PARAM_KEY } from '@/page-layout/dashboard-filters/constants/DashboardFilterUrlQueryParamKey';

// Only the dashboard filter params matter for sync; sorting makes the string independent of param order.
export const serializeDashboardFilterSearchParams = (
  searchParams: URLSearchParams,
): string =>
  new URLSearchParams(
    Array.from(searchParams.entries())
      .filter(([key]) =>
        key.startsWith(`${DASHBOARD_FILTER_URL_QUERY_PARAM_KEY}[`),
      )
      .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey)),
  ).toString();
