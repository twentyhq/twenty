import { DASHBOARD_FILTER_QUERY_PARAM_KEY } from '@/page-layout/constants/DashboardFilterQueryParamKey';

export const getDashboardFilterSearch = (
  searchParams: URLSearchParams,
): string =>
  new URLSearchParams(
    [...searchParams.entries()].filter(([key]) =>
      key.startsWith(`${DASHBOARD_FILTER_QUERY_PARAM_KEY}[`),
    ),
  ).toString();
