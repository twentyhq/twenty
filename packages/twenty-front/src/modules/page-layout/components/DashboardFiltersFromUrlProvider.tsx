import { DashboardFiltersContext } from '@/page-layout/contexts/DashboardFiltersContext';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { type DashboardFilters } from '@/page-layout/types/DashboardFilters';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { getDashboardFilterSearch } from '@/page-layout/utils/getDashboardFilterSearch';
import { getEffectiveDashboardFilterValues } from '@/page-layout/utils/getEffectiveDashboardFilterValues';
import { parseDashboardFilterValuesFromSearchParams } from '@/page-layout/utils/parseDashboardFilterValuesFromSearchParams';
import { useUserFirstDayOfTheWeek } from '@/ui/input/components/internal/date/hooks/useUserFirstDayOfTheWeek';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { type ReactNode, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getEffectiveDashboardPageLayoutFilters } from 'twenty-shared/utils';

type DashboardFiltersFromUrlProviderProps = {
  pageLayoutFilters: PageLayout['filters'];
  children: ReactNode;
};

export const DashboardFiltersFromUrlProvider = ({
  pageLayoutFilters,
  children,
}: DashboardFiltersFromUrlProviderProps) => {
  const [searchParams] = useSearchParams();
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();
  // Edit mode previews what every viewer sees by default
  const dashboardFilterSearch = isPageLayoutInEditMode
    ? ''
    : getDashboardFilterSearch(searchParams);
  const { userTimezone } = useUserTimezone();
  const { userFirstDayOfTheWeek } = useUserFirstDayOfTheWeek();

  // Widgets query and subscribe with these values: other query params must not renew them
  const dashboardFilters = useMemo((): DashboardFilters => {
    const dashboardPageLayoutFilters =
      getEffectiveDashboardPageLayoutFilters(pageLayoutFilters);

    const urlValueByPageLayoutFilterId =
      parseDashboardFilterValuesFromSearchParams(
        new URLSearchParams(dashboardFilterSearch),
      );

    return {
      pageLayoutFilters: dashboardPageLayoutFilters,
      urlValueByPageLayoutFilterId,
      values: getEffectiveDashboardFilterValues({
        pageLayoutFilters: dashboardPageLayoutFilters,
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
