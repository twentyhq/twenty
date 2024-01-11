import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { useFiltersFromQueryParams } from '@/views/hooks/internal/useFiltersFromQueryParams';
import { useViewScopedStates } from '@/views/hooks/internal/useViewScopedStates';
import { useViewBar } from '@/views/hooks/useViewBar';

export const FilterQueryParamsEffect = () => {
  const { hasFiltersQueryParams, getFiltersFromQueryParams } =
    useFiltersFromQueryParams();
  const { currentViewFiltersState, onViewFiltersChangeState } =
    useViewScopedStates();
  const setCurrentViewFilters = useSetRecoilState(currentViewFiltersState);
  const onViewFiltersChange = useRecoilValue(onViewFiltersChangeState);
  const { resetViewBar } = useViewBar();

  useEffect(() => {
    if (!hasFiltersQueryParams) return;

    getFiltersFromQueryParams().then((filtersFromParams) => {
      if (Array.isArray(filtersFromParams)) {
        setCurrentViewFilters(filtersFromParams);
        onViewFiltersChange?.(filtersFromParams);
      }
    });

    return () => {
      resetViewBar();
    };
  }, [
    getFiltersFromQueryParams,
    hasFiltersQueryParams,
    onViewFiltersChange,
    resetViewBar,
    setCurrentViewFilters,
  ]);

  return null;
};
