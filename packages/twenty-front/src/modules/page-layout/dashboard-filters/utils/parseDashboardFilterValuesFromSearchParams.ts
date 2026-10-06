import { DASHBOARD_FILTER_URL_QUERY_PARAM_KEY } from '@/page-layout/dashboard-filters/constants/DashboardFilterUrlQueryParamKey';
import { type DashboardFilterValues } from '@/page-layout/dashboard-filters/types/DashboardFilterValues';
import qs from 'qs';
import { ViewFilterOperand } from 'twenty-shared/types';
import z from 'zod';

const dashboardFilterUrlQueryParamsSchema = z.object({
  [DASHBOARD_FILTER_URL_QUERY_PARAM_KEY]: z
    .record(
      z.string(),
      z.object({
        operand: z.enum(ViewFilterOperand),
        value: z.string().optional(),
      }),
    )
    .optional(),
});

export const parseDashboardFilterValuesFromSearchParams = ({
  searchParams,
  slotIds,
}: {
  searchParams: URLSearchParams;
  slotIds: string[];
}): DashboardFilterValues => {
  const parsedQueryParams = dashboardFilterUrlQueryParamsSchema.safeParse(
    qs.parse(searchParams.toString()),
  );

  if (!parsedQueryParams.success) {
    return {};
  }

  const dashboardFilterQueryParams =
    parsedQueryParams.data[DASHBOARD_FILTER_URL_QUERY_PARAM_KEY] ?? {};

  return Object.fromEntries(
    slotIds
      .filter((slotId) => slotId in dashboardFilterQueryParams)
      .map((slotId) => [
        slotId,
        {
          operand: dashboardFilterQueryParams[slotId].operand,
          value: dashboardFilterQueryParams[slotId].value ?? '',
        },
      ]),
  );
};
