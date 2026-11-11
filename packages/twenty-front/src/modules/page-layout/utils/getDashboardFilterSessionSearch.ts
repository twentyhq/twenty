import { parseDashboardFilterValuesFromSearchParams } from '@/page-layout/utils/parseDashboardFilterValuesFromSearchParams';
import { setDashboardFilterValueInSearchParams } from '@/page-layout/utils/setDashboardFilterValueInSearchParams';

// Only values the bar can apply, re-serialized, so a malformed link is never remembered
export const getDashboardFilterSessionSearch = (
  searchParams: URLSearchParams,
): string =>
  Object.entries(parseDashboardFilterValuesFromSearchParams(searchParams))
    .reduce(
      (sessionSearchParams, [pageLayoutFilterId, value]) =>
        setDashboardFilterValueInSearchParams({
          searchParams: sessionSearchParams,
          pageLayoutFilterId,
          value,
        }),
      new URLSearchParams(),
    )
    .toString();
