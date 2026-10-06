import { DASHBOARD_FILTER_URL_QUERY_PARAM_KEY } from '@/page-layout/dashboard-filters/constants/DashboardFilterUrlQueryParamKey';
import { type DashboardFilterValues } from '@/page-layout/dashboard-filters/types/DashboardFilterValues';
import { isDefined } from 'twenty-shared/utils';

export const serializeDashboardFilterValuesToSearchParams = ({
  searchParams,
  pageLayoutId,
  values,
}: {
  searchParams: URLSearchParams;
  pageLayoutId: string;
  values: DashboardFilterValues;
}): URLSearchParams => {
  const nextSearchParams = new URLSearchParams(searchParams);

  const pageLayoutParamPrefix = `${DASHBOARD_FILTER_URL_QUERY_PARAM_KEY}[${pageLayoutId}][`;

  for (const key of Array.from(nextSearchParams.keys())) {
    if (key.startsWith(pageLayoutParamPrefix)) {
      nextSearchParams.delete(key);
    }
  }

  for (const [slotId, value] of Object.entries(values)) {
    if (!isDefined(value)) {
      continue;
    }

    nextSearchParams.set(
      `${pageLayoutParamPrefix}${slotId}][operand]`,
      value.operand,
    );
    nextSearchParams.set(
      `${pageLayoutParamPrefix}${slotId}][value]`,
      value.value,
    );
  }

  return nextSearchParams;
};
