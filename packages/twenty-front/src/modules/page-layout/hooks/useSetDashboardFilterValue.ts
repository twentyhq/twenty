import { setDashboardFilterValueInSearchParams } from '@/page-layout/utils/setDashboardFilterValueInSearchParams';
import { useNavigate } from 'react-router-dom';
import { type PageLayoutFilterValue } from 'twenty-shared/types';

export const useSetDashboardFilterValue = () => {
  const navigate = useNavigate();

  // Reads the URL at call time and keeps the tab hash, which setSearchParams drops
  // oxlint-disable-next-line twenty/no-navigate-prefer-link
  const setDashboardFilterValue = ({
    pageLayoutFilterId,
    value,
  }: {
    pageLayoutFilterId: string;
    value: PageLayoutFilterValue | null;
  }) => {
    const { search, hash } = window.location;

    navigate(
      {
        search: setDashboardFilterValueInSearchParams({
          searchParams: new URLSearchParams(search),
          pageLayoutFilterId,
          value,
        }).toString(),
        hash,
      },
      { replace: true },
    );
  };

  return { setDashboardFilterValue };
};
