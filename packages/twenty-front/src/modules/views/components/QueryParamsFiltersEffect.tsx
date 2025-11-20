import { useEffect } from 'react';

import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useFiltersFromQueryParams } from '@/views/hooks/internal/useFiltersFromQueryParams';
import { useHasFiltersInQueryParams } from '@/views/hooks/internal/useHasFiltersInQueryParams';
import { useObjectMetadataFromRoute } from '@/views/hooks/internal/useObjectMetadataFromRoute';
import { useApplyViewFiltersToCurrentRecordFilters } from '@/views/hooks/useApplyViewFiltersToCurrentRecordFilters';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { isDefined } from 'twenty-shared/utils';

export const QueryParamsFiltersEffect = () => {
  const { getFiltersFromQueryParams, getFilterGroupsFromQueryParams } =
    useFiltersFromQueryParams();
  const { hasFiltersQueryParams } = useHasFiltersInQueryParams();
  const { objectMetadataItem } = useObjectMetadataFromRoute();

  const { currentView } = useGetCurrentViewOnly();

  const { applyViewFiltersToCurrentRecordFilters } =
    useApplyViewFiltersToCurrentRecordFilters();

  const { recordIndexId } = useRecordIndexContextOrThrow();
  const setCurrentRecordFilters = useSetRecoilComponentState(
    currentRecordFiltersComponentState,
    recordIndexId,
  );
  const setCurrentRecordFilterGroups = useSetRecoilComponentState(
    currentRecordFilterGroupsComponentState,
    recordIndexId,
  );

  const currentViewObjectMetadataItemIsDifferentFromURLObjectMetadataItem =
    currentView?.objectMetadataId !== objectMetadataItem.id;

  useEffect(() => {
    if (
      !hasFiltersQueryParams ||
      currentViewObjectMetadataItemIsDifferentFromURLObjectMetadataItem
    ) {
      return;
    }

    // Parse and apply both simple filters and filter groups
    Promise.all([
      getFiltersFromQueryParams(),
      getFilterGroupsFromQueryParams(),
    ]).then(([filtersFromParams, filterGroupsFromParams]) => {
      // eslint-disable-next-line no-console
      console.log(
        '[Query Params Effect] Applying filters to state:',
        JSON.stringify({
          hasFilterGroups:
            (filterGroupsFromParams?.recordFilterGroups.length ?? 0) > 0,
          filterGroupsCount:
            filterGroupsFromParams?.recordFilterGroups.length ?? 0,
          filtersCount: filterGroupsFromParams?.recordFilters.length ?? 0,
          legacyFiltersCount: Array.isArray(filtersFromParams)
            ? filtersFromParams.length
            : 0,
        }),
      );

      // If we have filter groups from URL, use them directly
      if (
        isDefined(filterGroupsFromParams) &&
        (filterGroupsFromParams.recordFilterGroups.length > 0 ||
          filterGroupsFromParams.recordFilters.length > 0)
      ) {
        if (filterGroupsFromParams.recordFilterGroups.length > 0) {
          setCurrentRecordFilterGroups(
            filterGroupsFromParams.recordFilterGroups,
          );
        }
        if (filterGroupsFromParams.recordFilters.length > 0) {
          setCurrentRecordFilters(filterGroupsFromParams.recordFilters);
        }
      }
      // Otherwise apply simple filters (legacy format)
      else if (Array.isArray(filtersFromParams)) {
        applyViewFiltersToCurrentRecordFilters(filtersFromParams);
      }
    });
  }, [
    currentViewObjectMetadataItemIsDifferentFromURLObjectMetadataItem,
    applyViewFiltersToCurrentRecordFilters,
    getFiltersFromQueryParams,
    getFilterGroupsFromQueryParams,
    hasFiltersQueryParams,
    setCurrentRecordFilterGroups,
    setCurrentRecordFilters,
  ]);

  return <></>;
};
