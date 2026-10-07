import { DASHBOARD_FILTER_URL_QUERY_PARAM_KEY } from '@/page-layout/dashboard-filters/constants/DashboardFilterUrlQueryParamKey';
import qs from 'qs';
import {
  type DashboardFilterValue,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import z from 'zod';

// A malformed entry for one slot must only drop that slot, never the whole record.
const dashboardFilterUrlQueryParamsSchema = z.object({
  [DASHBOARD_FILTER_URL_QUERY_PARAM_KEY]: z
    .record(
      z.string(),
      z
        .object({
          operand: z.enum(ViewFilterOperand),
          value: z.string().optional(),
        })
        .optional()
        .catch(undefined),
    )
    .optional()
    .catch(undefined),
});

export const parseDashboardFilterValuesFromSearchParams = ({
  searchParams,
  slotIds,
}: {
  searchParams: URLSearchParams;
  slotIds: string[];
}): Record<string, DashboardFilterValue> => {
  const queryParamsValidation = dashboardFilterUrlQueryParamsSchema.safeParse(
    qs.parse(searchParams.toString()),
  );

  if (!queryParamsValidation.success) {
    return {};
  }

  const dashboardFilterQueryParams =
    queryParamsValidation.data[DASHBOARD_FILTER_URL_QUERY_PARAM_KEY];

  if (!isDefined(dashboardFilterQueryParams)) {
    return {};
  }

  return Object.fromEntries(
    slotIds.flatMap((slotId) => {
      const slotQueryParams = dashboardFilterQueryParams[slotId];

      if (!isDefined(slotQueryParams)) {
        return [];
      }

      return [
        [
          slotId,
          {
            operand: slotQueryParams.operand,
            value: slotQueryParams.value ?? '',
          },
        ],
      ];
    }),
  );
};
