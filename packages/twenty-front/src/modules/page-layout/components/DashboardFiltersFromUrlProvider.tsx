import { DashboardFiltersContext } from '@/page-layout/contexts/DashboardFiltersContext';
import { type DashboardFilters } from '@/page-layout/types/DashboardFilters';
import { getDashboardFilterSearch } from '@/page-layout/utils/getDashboardFilterSearch';
import { getEffectiveDashboardFilterValues } from '@/page-layout/utils/getEffectiveDashboardFilterValues';
import { parseDashboardFilterValuesFromSearchParams } from '@/page-layout/utils/parseDashboardFilterValuesFromSearchParams';
import { useUserFirstDayOfTheWeek } from '@/ui/input/components/internal/date/hooks/useUserFirstDayOfTheWeek';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { type ReactNode, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { type PageLayout } from '~/generated-metadata/graphql';

type DashboardFiltersFromUrlProviderProps = {
  pageLayoutFilters: PageLayout['filters'];
  children: ReactNode;
};

export const DashboardFiltersFromUrlProvider = ({
  pageLayoutFilters,
  children,
}: DashboardFiltersFromUrlProviderProps) => {
  const [searchParams] = useSearchParams();
  const dashboardFilterSearch = getDashboardFilterSearch(searchParams);
  const { userTimezone } = useUserTimezone();
  const { userFirstDayOfTheWeek } = useUserFirstDayOfTheWeek();

  // Widgets query and subscribe with these values: other query params must not renew them
  const dashboardFilters = useMemo((): DashboardFilters => {
    const sortedPageLayoutFilters = [...(pageLayoutFilters ?? [])].sort(
      (firstFilter, secondFilter) =>
        firstFilter.position - secondFilter.position,
    );

    const urlValueByPageLayoutFilterId =
      parseDashboardFilterValuesFromSearchParams(
        new URLSearchParams(dashboardFilterSearch),
      );

    return {
      pageLayoutFilters: sortedPageLayoutFilters,
      urlValueByPageLayoutFilterId,
      values: getEffectiveDashboardFilterValues({
        pageLayoutFilters: sortedPageLayoutFilters,
        urlValueByPageLayoutFilterId,
        timeZone: userTimezone,
        firstDayOfTheWeek: userFirstDayOfTheWeek,
      }),
      timeZone: userTimezone,
      firstDayOfTheWeek: userFirstDayOfTheWeek,
    };
  }, [
    pageLayoutFilters,
    dashboardFilterSearch,
    userTimezone,
    userFirstDayOfTheWeek,
  ]);

  return (
    <DashboardFiltersContext.Provider value={dashboardFilters}>
      {children}
    </DashboardFiltersContext.Provider>
  );
};
