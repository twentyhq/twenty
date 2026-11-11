import { DashboardFilterSessionMemoryEffect } from '@/page-layout/components/DashboardFilterSessionMemoryEffect';
import { DashboardFiltersContext } from '@/page-layout/contexts/DashboardFiltersContext';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { type DashboardFilters } from '@/page-layout/types/DashboardFilters';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { dashboardFilterSessionSearchFamilyState } from '@/page-layout/states/dashboardFilterSessionSearchFamilyState';
import { getDashboardFilterSessionSearch } from '@/page-layout/utils/getDashboardFilterSessionSearch';
import { getEffectiveDashboardFilterValues } from '@/page-layout/utils/getEffectiveDashboardFilterValues';
import { parseDashboardFilterValuesFromSearchParams } from '@/page-layout/utils/parseDashboardFilterValuesFromSearchParams';
import { useUserFirstDayOfTheWeek } from '@/ui/input/components/internal/date/hooks/useUserFirstDayOfTheWeek';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getEffectiveDashboardPageLayoutFilters } from 'twenty-shared/utils';

type DashboardFiltersFromUrlProviderProps = {
  pageLayoutId: string;
  pageLayoutFilters: PageLayout['filters'];
  children: ReactNode;
};

export const DashboardFiltersFromUrlProvider = ({
  pageLayoutId,
  pageLayoutFilters,
  children,
}: DashboardFiltersFromUrlProviderProps) => {
  const [searchParams] = useSearchParams();
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();
  const dashboardFilterSessionSearch = useAtomFamilyStateValue(
    dashboardFilterSessionSearchFamilyState,
    { pageLayoutId },
  );
  const urlDashboardFilterSearch =
    getDashboardFilterSessionSearch(searchParams);
  // Edit mode previews what every viewer sees by default; the remembered value
  // applies from the first render, before the effect writes it into the URL
  const viewModeDashboardFilterSearch = isNonEmptyString(
    urlDashboardFilterSearch,
  )
    ? urlDashboardFilterSearch
    : dashboardFilterSessionSearch;
  const dashboardFilterSearch = isPageLayoutInEditMode
    ? ''
    : viewModeDashboardFilterSearch;
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
      <DashboardFilterSessionMemoryEffect />
      {children}
    </DashboardFiltersContext.Provider>
  );
};
