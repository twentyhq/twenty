import { DASHBOARD_FILTER_QUERY_PARAM_KEY } from '@/page-layout/constants/DashboardFilterQueryParamKey';
import { type PageLayoutFilterValue } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const setDashboardFilterValueInSearchParams = ({
  searchParams,
  pageLayoutFilterId,
  value,
}: {
  searchParams: URLSearchParams;
  pageLayoutFilterId: string;
  value: PageLayoutFilterValue | null;
}): URLSearchParams => {
  const pageLayoutFilterKey = `${DASHBOARD_FILTER_QUERY_PARAM_KEY}[${pageLayoutFilterId}]`;

  const nextSearchParams = new URLSearchParams(
    [...searchParams.entries()].filter(
      ([key]) =>
        key !== pageLayoutFilterKey &&
        !key.startsWith(`${pageLayoutFilterKey}[`),
    ),
  );

  if (!isDefined(value)) {
    return nextSearchParams;
  }

  if (value.conditions.length === 0) {
    nextSearchParams.append(pageLayoutFilterKey, '');
  }

  for (const { operand, value: conditionValue } of value.conditions) {
    nextSearchParams.append(
      `${pageLayoutFilterKey}[${operand}]`,
      conditionValue,
    );
  }

  return nextSearchParams;
};
