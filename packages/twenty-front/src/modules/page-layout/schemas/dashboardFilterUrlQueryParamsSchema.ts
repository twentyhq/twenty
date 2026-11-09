import { DASHBOARD_FILTER_QUERY_PARAM_KEY } from '@/page-layout/constants/DashboardFilterQueryParamKey';
import z from 'zod';

export const dashboardFilterUrlQueryParamsSchema = z
  .object({
    [DASHBOARD_FILTER_QUERY_PARAM_KEY]: z
      .record(z.string(), z.unknown())
      .optional(),
  })
  .catch({});
