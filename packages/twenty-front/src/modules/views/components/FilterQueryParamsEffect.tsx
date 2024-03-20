import { useEffect } from 'react';
import { isUndefined } from '@sniptt/guards';
import { useSetRecoilState } from 'recoil';

import { useViewFromQueryParams } from '@/views/hooks/internal/useViewFromQueryParams';
import { useViewStates } from '@/views/hooks/internal/useViewStates';
import { useResetCurrentView } from '@/views/hooks/useResetCurrentView';

export const FilterQueryParamsEffect = () => {
  const { hasFiltersQueryParams, getFiltersFromQueryParams, viewIdQueryParam } =
    useViewFromQueryParams();
  const { unsavedToUpsertViewFiltersState, currentViewIdState } =
    useViewStates();
  const setUnsavedViewFilter = useSetRecoilState(
    unsavedToUpsertViewFiltersState,
  );
  const setCurrentViewId = useSetRecoilState(currentViewIdState);
  const { resetCurrentView } = useResetCurrentView();

  useEffect(() => {
    if (isUndefined(viewIdQueryParam) || !viewIdQueryParam) {
      return;
    }

    setCurrentViewId(viewIdQueryParam);
  }, [getFiltersFromQueryParams, setCurrentViewId, viewIdQueryParam]);

  useEffect(() => {
    if (!hasFiltersQueryParams) return;

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

  return null;
};
