import { useEffect } from 'react';

import { useViewFromQueryParams } from '@/views/hooks/internal/useViewFromQueryParams';
import { useApplyViewFiltersToCurrentRecordFilters } from '@/views/hooks/useApplyViewFiltersToCurrentRecordFilters';

export const QueryParamsFiltersEffect = () => {
  const { hasFiltersQueryParams, getFiltersFromQueryParams } =
    useViewFromQueryParams();

  const { applyViewFiltersToCurrentRecordFilters } =
    useApplyViewFiltersToCurrentRecordFilters();

  useEffect(() => {
    if (!hasFiltersQueryParams) {
      return;
    }

    getFiltersFromQueryParams().then((filtersFromParams) => {
      if (Array.isArray(filtersFromParams)) {
        applyViewFiltersToCurrentRecordFilters(filtersFromParams);
      }
    });
  }, [
    applyViewFiltersToCurrentRecordFilters,
    getFiltersFromQueryParams,
    hasFiltersQueryParams,
  ]);

  return <></>;
};
