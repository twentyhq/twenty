import { DASHBOARD_FILTER_QUERY_PARAM_KEY } from '@/page-layout/constants/DashboardFilterQueryParamKey';
import { dashboardFilterUrlQueryParamsSchema } from '@/page-layout/schemas/dashboardFilterUrlQueryParamsSchema';
import { dashboardFilterUrlValueSchema } from '@/page-layout/schemas/dashboardFilterUrlValueSchema';
import qs from 'qs';
import { type PageLayoutFilterValue } from 'twenty-shared/types';

export const parseDashboardFilterValuesFromSearchParams = (
  searchParams: URLSearchParams,
): Record<string, PageLayoutFilterValue> => {
  const urlValueByPageLayoutFilterId =
    dashboardFilterUrlQueryParamsSchema.parse(
      qs.parse(searchParams.toString()),
    )[DASHBOARD_FILTER_QUERY_PARAM_KEY] ?? {};

  return Object.fromEntries(
    Object.entries(urlValueByPageLayoutFilterId).flatMap(
      ([pageLayoutFilterId, urlValue]) => {
        const value = dashboardFilterUrlValueSchema.safeParse(urlValue);

        return value.success ? [[pageLayoutFilterId, value.data]] : [];
      },
    ),
  );
};
