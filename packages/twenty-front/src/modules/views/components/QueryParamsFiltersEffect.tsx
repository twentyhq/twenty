import { useEffect } from 'react';

import { useSetRecoilInstanceState } from '@/ui/utilities/state/instance/hooks/useSetRecoilInstanceState';
import { useViewFromQueryParams } from '@/views/hooks/internal/useViewFromQueryParams';
import { useResetCurrentView } from '@/views/hooks/useResetCurrentView';
import { unsavedToUpsertViewFiltersInstanceState } from '@/views/states/unsavedToUpsertViewFiltersInstanceState';

export const QueryParamsFiltersEffect = () => {
  const { hasFiltersQueryParams, getFiltersFromQueryParams } =
    useViewFromQueryParams();

  const setUnsavedViewFilter = useSetRecoilInstanceState(
    unsavedToUpsertViewFiltersInstanceState,
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
