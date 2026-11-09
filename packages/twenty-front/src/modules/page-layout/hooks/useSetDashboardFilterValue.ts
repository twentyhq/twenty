import { removeDashboardFilterValuesFromSearchParams } from '@/page-layout/utils/removeDashboardFilterValuesFromSearchParams';
import { setDashboardFilterValueInSearchParams } from '@/page-layout/utils/setDashboardFilterValueInSearchParams';
import { useLocation, useNavigate } from 'react-router-dom';
import { type PageLayoutFilterValue } from 'twenty-shared/types';

export const useSetDashboardFilterValue = () => {
  const navigate = useNavigate();
  // The router location, not window.location, so a dashboard in the side panel edits its own URL
  const { search, hash } = useLocation();

  // Keeps the tab hash, which setSearchParams drops
  // oxlint-disable-next-line twenty/no-navigate-prefer-link
  const replaceSearch = (searchParams: URLSearchParams) =>
    navigate({ search: searchParams.toString(), hash }, { replace: true });

  const setDashboardFilterValue = ({
    pageLayoutFilterId,
    value,
  }: {
    pageLayoutFilterId: string;
    value: PageLayoutFilterValue | null;
  }) =>
    replaceSearch(
      setDashboardFilterValueInSearchParams({
        searchParams: new URLSearchParams(search),
        pageLayoutFilterId,
        value,
      }),
    );

  const resetDashboardFilterValues = () =>
    replaceSearch(
      removeDashboardFilterValuesFromSearchParams(new URLSearchParams(search)),
    );

  return { setDashboardFilterValue, resetDashboardFilterValues };
};
