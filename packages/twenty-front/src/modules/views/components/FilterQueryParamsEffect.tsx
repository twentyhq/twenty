import { useEffect } from 'react';
import { isUndefined } from '@sniptt/guards';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { useViewFromQueryParams } from '@/views/hooks/internal/useViewFromQueryParams';
import { useViewStates } from '@/views/hooks/internal/useViewStates';
import { useResetCurrentView } from '@/views/hooks/useResetCurrentView';
import { isDefined } from '~/utils/isDefined';

export const FilterQueryParamsEffect = () => {
  const { hasFiltersQueryParams, getFiltersFromQueryParams, viewIdQueryParam } =
    useViewFromQueryParams();
  const { unsavedToUpsertViewFiltersState, currentViewIdState } =
    useViewStates();
  const setUnsavedViewFilter = useSetRecoilState(
    unsavedToUpsertViewFiltersState,
  );
  const [currentViewId, setCurrentViewId] = useRecoilState(currentViewIdState);
  const { resetCurrentView } = useResetCurrentView();

  useEffect(() => {
    if (
      isUndefined(viewIdQueryParam) ||
      !viewIdQueryParam ||
      isDefined(currentViewId)
    ) {
      return;
    }

    setCurrentViewId(viewIdQueryParam);
  }, [
    currentViewId,
    getFiltersFromQueryParams,
    setCurrentViewId,
    viewIdQueryParam,
  ]);

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
