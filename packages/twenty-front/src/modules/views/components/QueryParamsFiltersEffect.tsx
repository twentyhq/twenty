import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { useViewFromQueryParams } from '@/views/hooks/internal/useViewFromQueryParams';
import { useViewStates } from '@/views/hooks/internal/useViewStates';
import { useResetCurrentView } from '@/views/hooks/useResetCurrentView';

export const QueryParamsFiltersEffect = () => {
  const { hasFiltersQueryParams, getFiltersFromQueryParams } =
    useViewFromQueryParams();
  const { unsavedToUpsertViewFiltersState } = useViewStates();
  const setUnsavedViewFilter = useSetRecoilState(
    unsavedToUpsertViewFiltersState,
  );
  const { resetCurrentView } = useResetCurrentView();

  useEffect(() => {
    if (!hasFiltersQueryParams) {
      return;
    }

    getFiltersFromQueryParams().then((filtersFromParams) => {
      if (Array.isArray(filtersFromParams)) {
        setUnsavedViewFilter(filtersFromParams);
      }
    });

    return () => {
      resetCurrentView();
    };
  }, [
    getFiltersFromQueryParams,
    hasFiltersQueryParams,
    resetCurrentView,
    setUnsavedViewFilter,
  ]);

  return <></>;
};
