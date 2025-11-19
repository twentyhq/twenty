import { useEffect } from 'react';

import { useFiltersFromQueryParams } from '@/views/hooks/internal/useFiltersFromQueryParams';
import { useApplyViewFiltersToCurrentRecordFilters } from '@/views/hooks/useApplyViewFiltersToCurrentRecordFilters';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';

export const QueryParamsFiltersEffect = () => {
  const {
    hasFiltersQueryParams,
    getFiltersFromQueryParams,
    objectMetadataItem,
  } = useFiltersFromQueryParams();

  const { currentView } = useGetCurrentViewOnly();

  const { applyViewFiltersToCurrentRecordFilters } =
    useApplyViewFiltersToCurrentRecordFilters();

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
      }
    });
  }, [
    currentViewObjectMetadataItemIsDifferentFromURLObjectMetadataItem,
    applyViewFiltersToCurrentRecordFilters,
    getFiltersFromQueryParams,
    hasFiltersQueryParams,
  ]);

  return <></>;
};
