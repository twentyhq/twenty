import { DASHBOARD_FILTER_URL_QUERY_PARAM_KEY } from '@/page-layout/dashboard-filters/constants/DashboardFilterUrlQueryParamKey';
import { type DashboardFilterValues } from '@/page-layout/dashboard-filters/types/DashboardFilterValues';
import qs from 'qs';
import {
  type DashboardFilterSlot,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { isDashboardFilterValueValidForSlot } from 'twenty-shared/utils';
import z from 'zod';

const dashboardFilterUrlQueryParamsSchema = z.object({
  [DASHBOARD_FILTER_URL_QUERY_PARAM_KEY]: z
    .record(
      z.string(),
      z.record(
        z.string(),
        z
          .object({
            operand: z.enum(ViewFilterOperand),
            value: z.string().optional(),
          })
          // A malformed slot only drops that slot, never the whole set.
          .optional()
          .catch(undefined),
      ),
    )
    .optional(),
});

export const parseDashboardFilterValuesFromSearchParams = ({
  searchParams,
  pageLayoutId,
  slots,
}: {
  searchParams: URLSearchParams;
  pageLayoutId: string;
  slots: DashboardFilterSlot[];
}): DashboardFilterValues => {
  const parsedQueryParams = dashboardFilterUrlQueryParamsSchema.safeParse(
    qs.parse(searchParams.toString()),
  );

  if (!parsedQueryParams.success) {
    return {};
  }

  const valuesFromUrlBySlotId =
    parsedQueryParams.data[DASHBOARD_FILTER_URL_QUERY_PARAM_KEY]?.[
      pageLayoutId
    ] ?? {};

  return Object.fromEntries(
    slots.flatMap((slot) => {
      const valueFromUrl = valuesFromUrlBySlotId[slot.id];

      if (valueFromUrl === undefined) {
        return [];
      }

      const value = {
        operand: valueFromUrl.operand,
        value: valueFromUrl.value ?? '',
      };

      return isDashboardFilterValueValidForSlot({ slot, value })
        ? [[slot.id, value]]
        : [];
    }),
  );
};
