import { DASHBOARD_FILTER_URL_QUERY_PARAM_KEY } from '@/page-layout/dashboard-filters/constants/DashboardFilterUrlQueryParamKey';
import { type DashboardFilterValues } from '@/page-layout/dashboard-filters/types/DashboardFilterValues';
import { type DashboardFilterSlot } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const serializeDashboardFilterValuesToSearchParams = ({
  searchParams,
  pageLayoutId,
  slots,
  values,
}: {
  searchParams: URLSearchParams;
  pageLayoutId: string;
  slots: DashboardFilterSlot[];
  values: DashboardFilterValues;
}): URLSearchParams => {
  const nextSearchParams = new URLSearchParams(searchParams);

  const pageLayoutParamPrefix = `${DASHBOARD_FILTER_URL_QUERY_PARAM_KEY}[${pageLayoutId}][`;

  for (const key of Array.from(nextSearchParams.keys())) {
    if (key.startsWith(pageLayoutParamPrefix)) {
      nextSearchParams.delete(key);
    }
  }

  // A value left behind by a slot that no longer exists stays out of the URL, like it stays out of the charts.
  for (const slot of slots) {
    const value = values[slot.id];

    if (!isDefined(value)) {
      continue;
    }

    nextSearchParams.set(
      `${pageLayoutParamPrefix}${slot.id}][operand]`,
      value.operand,
    );
    nextSearchParams.set(
      `${pageLayoutParamPrefix}${slot.id}][value]`,
      value.value,
    );
  }

  return nextSearchParams;
};
