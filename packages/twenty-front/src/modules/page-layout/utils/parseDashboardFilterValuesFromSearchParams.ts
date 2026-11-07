import { DASHBOARD_FILTER_QUERY_PARAM_KEY } from '@/page-layout/constants/DashboardFilterQueryParamKey';
import { DASHBOARD_FILTER_URL_OPERANDS } from '@/page-layout/constants/DashboardFilterUrlOperands';
import { type PageLayoutFilterValue } from 'twenty-shared/types';
import {
  getDashboardFilterConditionValueIssue,
  isDefined,
} from 'twenty-shared/utils';

const DASHBOARD_FILTER_QUERY_PARAM_PATTERN = new RegExp(
  `^${DASHBOARD_FILTER_QUERY_PARAM_KEY}\\[([^\\]]+)\\](?:\\[([^\\]]+)\\])?$`,
);

// An empty conditions list means the viewer explicitly chose no filter.
export const parseDashboardFilterValuesFromSearchParams = (
  searchParams: URLSearchParams,
): Record<string, PageLayoutFilterValue> => {
  const valueByPageLayoutFilterId: Record<string, PageLayoutFilterValue> = {};
  const invalidPageLayoutFilterIds = new Set<string>();

  for (const [key, value] of searchParams.entries()) {
    const [, pageLayoutFilterId, rawOperand] =
      DASHBOARD_FILTER_QUERY_PARAM_PATTERN.exec(key) ?? [];

    if (!isDefined(pageLayoutFilterId)) {
      continue;
    }

    const conditions =
      valueByPageLayoutFilterId[pageLayoutFilterId]?.conditions ?? [];

    const operand = DASHBOARD_FILTER_URL_OPERANDS.find(
      (urlOperand) => urlOperand === rawOperand,
    );

    if (!isDefined(rawOperand)) {
      valueByPageLayoutFilterId[pageLayoutFilterId] = { conditions };
      continue;
    }

    if (
      !isDefined(operand) ||
      isDefined(getDashboardFilterConditionValueIssue({ operand, value }))
    ) {
      invalidPageLayoutFilterIds.add(pageLayoutFilterId);
      continue;
    }

    valueByPageLayoutFilterId[pageLayoutFilterId] = {
      conditions: [...conditions, { operand, value }],
    };
  }

  return Object.fromEntries(
    Object.entries(valueByPageLayoutFilterId).filter(
      ([pageLayoutFilterId]) =>
        !invalidPageLayoutFilterIds.has(pageLayoutFilterId),
    ),
  );
};
