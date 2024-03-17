import { useEffect } from 'react';
import { isUndefined } from '@sniptt/guards';
import { useSetRecoilState } from 'recoil';

import { useViewFromQueryParams } from '@/views/hooks/internal/useViewFromQueryParams';
import { useViewStates } from '@/views/hooks/internal/useViewStates';
import { useViewBar } from '@/views/hooks/useViewBar';

export const FilterQueryParamsEffect = () => {
  const { hasFiltersQueryParams, getFiltersFromQueryParams, viewIdQueryParam } =
    useViewFromQueryParams();
  const { unsavedToUpsertViewFiltersState, currentViewIdState } =
    useViewStates();
  const setUnsavedViewFilter = useSetRecoilState(
    unsavedToUpsertViewFiltersState,
  );
  const setCurrentViewId = useSetRecoilState(currentViewIdState);
  const { resetCurrentViewFilterAndSorts } = useViewBar();

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
      resetCurrentViewFilterAndSorts();
    };
  }, [
    getFiltersFromQueryParams,
    hasFiltersQueryParams,
    resetCurrentViewFilterAndSorts,
    setUnsavedViewFilter,
  ]);

  return null;
};
