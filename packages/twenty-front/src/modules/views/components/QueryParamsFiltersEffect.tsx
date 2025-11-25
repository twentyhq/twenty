import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useFiltersFromQueryParams } from '@/views/hooks/internal/useFiltersFromQueryParams';
import { useHasFiltersInQueryParams } from '@/views/hooks/internal/useHasFiltersInQueryParams';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useMapViewFiltersToFilters } from '@/views/hooks/useMapViewFiltersToFilters';
import { isDefined } from 'twenty-shared/utils';

export const QueryParamsFiltersEffect = () => {
  const { getFiltersFromQueryParams, getFilterGroupsFromQueryParams } =
    useFiltersFromQueryParams();
  const { hasFiltersQueryParams } = useHasFiltersInQueryParams();

  const { objectNamePlural = '' } = useParams();
  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { currentView } = useGetCurrentViewOnly();

  const { mapViewFiltersToRecordFilters } = useMapViewFiltersToFilters();

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

    const loadFiltersFromQueryParams = async () => {
      const [filtersFromParams, filterGroupsFromParams] = await Promise.all([
        getFiltersFromQueryParams(),
        getFilterGroupsFromQueryParams(),
      ]);

      const allRecordFilters = [];

      if (
        isDefined(filterGroupsFromParams) &&
        filterGroupsFromParams.recordFilters.length > 0
      ) {
        allRecordFilters.push(...filterGroupsFromParams.recordFilters);
      }

      if (Array.isArray(filtersFromParams) && filtersFromParams.length > 0) {
        const simpleRecordFilters =
          mapViewFiltersToRecordFilters(filtersFromParams);
        allRecordFilters.push(...simpleRecordFilters);
      }

      if (
        isDefined(filterGroupsFromParams) &&
        filterGroupsFromParams.recordFilterGroups.length > 0
      ) {
        setCurrentRecordFilterGroups(filterGroupsFromParams.recordFilterGroups);
      }

      if (allRecordFilters.length > 0) {
        setCurrentRecordFilters(allRecordFilters);
      }
    };

    loadFiltersFromQueryParams();
  }, [
    currentViewObjectMetadataItemIsDifferentFromURLObjectMetadataItem,
    mapViewFiltersToRecordFilters,
    getFiltersFromQueryParams,
    getFilterGroupsFromQueryParams,
    hasFiltersQueryParams,
    setCurrentRecordFilterGroups,
    setCurrentRecordFilters,
  ]);

  return null;
};
