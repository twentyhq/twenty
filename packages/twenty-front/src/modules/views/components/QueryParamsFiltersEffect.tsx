import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useFiltersFromQueryParams } from '@/views/hooks/internal/useFiltersFromQueryParams';
import { useHasFiltersInQueryParams } from '@/views/hooks/internal/useHasFiltersInQueryParams';
import { useObjectMetadataFromRoute } from '@/views/hooks/internal/useObjectMetadataFromRoute';
import { useApplyViewFiltersToCurrentRecordFilters } from '@/views/hooks/useApplyViewFiltersToCurrentRecordFilters';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';

export const QueryParamsFiltersEffect = () => {
  const { getFiltersFromQueryParams } = useFiltersFromQueryParams();
  const { hasFiltersQueryParams } = useHasFiltersInQueryParams();
  const { objectMetadataItem } = useObjectMetadataFromRoute();

  const { currentView } = useGetCurrentViewOnly();

  const { applyViewFiltersToCurrentRecordFilters } =
    useApplyViewFiltersToCurrentRecordFilters();

  const [, setSearchParams] = useSearchParams();

  const currentViewObjectMetadataItemIsDifferentFromURLObjectMetadataItem =
    currentView?.objectMetadataId !== objectMetadataItem.id;

  useEffect(() => {
    if (
      !hasFiltersQueryParams ||
      currentViewObjectMetadataItemIsDifferentFromURLObjectMetadataItem
    ) {
      return;
    }

    getFiltersFromQueryParams().then((filtersFromParams) => {
      if (Array.isArray(filtersFromParams)) {
        applyViewFiltersToCurrentRecordFilters(filtersFromParams);

        setSearchParams(
          (currentParams) => {
            const newParams = new URLSearchParams(currentParams);
            newParams.delete('filter');
            return newParams;
          },
          { replace: true },
        );
      }
    });
  }, [
    currentViewObjectMetadataItemIsDifferentFromURLObjectMetadataItem,
    applyViewFiltersToCurrentRecordFilters,
    getFiltersFromQueryParams,
    hasFiltersQueryParams,
    setSearchParams,
  ]);

  return <></>;
};
