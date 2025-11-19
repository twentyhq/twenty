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
    console.log('[QueryParamsFiltersEffect] Effect triggered', {
      hasFiltersQueryParams,
      currentViewObjectMetadataItemIsDifferentFromURLObjectMetadataItem,
    });

    if (
      !hasFiltersQueryParams ||
      currentViewObjectMetadataItemIsDifferentFromURLObjectMetadataItem
    ) {
      console.log('[QueryParamsFiltersEffect] Early return');
      return;
    }

    console.log('[QueryParamsFiltersEffect] Getting filters from params');
    getFiltersFromQueryParams().then((filtersFromParams) => {
      console.log(
        '[QueryParamsFiltersEffect] Filters from params:',
        JSON.stringify(filtersFromParams),
      );

      if (Array.isArray(filtersFromParams)) {
        console.log('[QueryParamsFiltersEffect] Applying filters to state');
        applyViewFiltersToCurrentRecordFilters(filtersFromParams);

        console.log('[QueryParamsFiltersEffect] Clearing filter params from URL');
        setSearchParams(
          (currentParams) => {
            console.log(
              '[QueryParamsFiltersEffect] Current params before clear:',
              currentParams.toString(),
            );
            const newParams = new URLSearchParams(currentParams);

            // Delete all keys starting with 'filter['
            Array.from(newParams.keys()).forEach((key) => {
              if (key.startsWith('filter[')) {
                newParams.delete(key);
              }
            });

            console.log(
              '[QueryParamsFiltersEffect] New params after clear:',
              newParams.toString(),
            );
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
