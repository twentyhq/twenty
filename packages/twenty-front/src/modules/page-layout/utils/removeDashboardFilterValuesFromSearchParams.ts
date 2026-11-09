import { DASHBOARD_FILTER_QUERY_PARAM_KEY } from '@/page-layout/constants/DashboardFilterQueryParamKey';

export const removeDashboardFilterValuesFromSearchParams = (
  searchParams: URLSearchParams,
): URLSearchParams =>
  new URLSearchParams(
    [...searchParams.entries()].filter(
      ([key]) => !key.startsWith(`${DASHBOARD_FILTER_QUERY_PARAM_KEY}[`),
    ),
  );
