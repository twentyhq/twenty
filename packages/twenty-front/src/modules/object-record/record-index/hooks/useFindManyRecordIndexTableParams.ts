import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useCurrentRecordGroupDefinition } from '@/object-record/record-group/hooks/useCurrentRecordGroupDefinition';
import { useRecordGroupFilter } from '@/object-record/record-group/hooks/useRecordGroupFilter';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import {
  combineFilters,
  computeRecordGqlOperationFilter,
  turnAnyFieldFilterIntoRecordGqlFilter,
} from 'twenty-shared/utils';

export const useFindManyRecordIndexTableParams = (
  objectNameSingular: string,
) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });
  const { objectMetadataItems } = useObjectMetadataItems();

  const { recordGroupFilter } = useRecordGroupFilter(
    objectMetadataItem?.fields,
  );

  const currentRecordGroupDefinition = useCurrentRecordGroupDefinition();

  const currentRecordFilterGroups = useRecoilComponentValueV2(
    currentRecordFilterGroupsComponentState,
  );

  const currentRecordSorts = useRecoilComponentValueV2(
    currentRecordSortsComponentState,
  );

  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const { filterValueDependencies } = useFilterValueDependencies();

  const currentFilters = computeRecordGqlOperationFilter({
    fields: objectMetadataItem?.fields ?? [],
    recordFilterGroups: currentRecordFilterGroups,
    recordFilters: currentRecordFilters,
    filterValueDependencies,
  });

  const anyFieldFilterValue = useRecoilComponentValueV2(
    anyFieldFilterValueComponentState,
  );

  const { recordGqlOperationFilter: anyFieldFilter } =
    turnAnyFieldFilterIntoRecordGqlFilter({
      fields: objectMetadataItem?.fields ?? [],
      filterValue: anyFieldFilterValue,
    });

  const orderBy = turnSortsIntoOrderBy(
    objectMetadataItem,
    currentRecordSorts,
    objectMetadataItems,
  );

  return {
    objectNameSingular,
    filter: combineFilters([currentFilters, recordGroupFilter, anyFieldFilter]),
    orderBy,
    // If we have a current record group definition, we only want to fetch 8 records by page
    ...(currentRecordGroupDefinition ? { limit: 8 } : {}),
  };
};
