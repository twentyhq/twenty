import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { dashboardFilterSessionSearchFamilyState } from '@/page-layout/states/dashboardFilterSessionSearchFamilyState';
import { getDashboardFilterSessionSearch } from '@/page-layout/utils/getDashboardFilterSessionSearch';
import { isDashboardFilterValueStoredAsDefault } from '@/page-layout/utils/isDashboardFilterValueStoredAsDefault';
import { removeDashboardFilterValuesFromSearchParams } from '@/page-layout/utils/removeDashboardFilterValuesFromSearchParams';
import { setDashboardFilterValueInSearchParams } from '@/page-layout/utils/setDashboardFilterValueInSearchParams';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { useLocation, useNavigate } from 'react-router-dom';
import { type PageLayoutFilterValue } from 'twenty-shared/types';

export const useSetDashboardFilterValue = () => {
  const navigate = useNavigate();
  // The router location, not window.location, so a dashboard in the side panel edits its own URL
  const { search, hash, state } = useLocation();
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();
  const setDashboardFilterSessionSearch = useSetAtomFamilyState(
    dashboardFilterSessionSearchFamilyState,
    { pageLayoutId: currentPageLayout.id },
  );

  // The memory is written first, so the URL change never reads as a value to restore
  const replaceSearch = (searchParams: URLSearchParams) => {
    setDashboardFilterSessionSearch(
      getDashboardFilterSessionSearch(searchParams),
    );
    // Keeps the tab hash and the router state, which setSearchParams drops
    // oxlint-disable-next-line twenty/no-navigate-prefer-link
    navigate(
      { search: searchParams.toString(), hash },
      { replace: true, state },
    );
  };

  const setDashboardFilterValue = ({
    pageLayoutFilterId,
    value,
    defaultValue,
  }: {
    pageLayoutFilterId: string;
    value: PageLayoutFilterValue;
    defaultValue: PageLayoutFilterValue | null | undefined;
  }) =>
    replaceSearch(
      setDashboardFilterValueInSearchParams({
        searchParams: new URLSearchParams(search),
        pageLayoutFilterId,
        value: isDashboardFilterValueStoredAsDefault(value, defaultValue)
          ? null
          : value,
      }),
    );

  const resetDashboardFilterValues = () =>
    replaceSearch(
      removeDashboardFilterValuesFromSearchParams(new URLSearchParams(search)),
    );

  return { setDashboardFilterValue, resetDashboardFilterValues };
};
