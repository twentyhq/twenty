import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { useAggregateRecords } from '@/object-record/hooks/useAggregateRecords';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useGetRecordGroupVisibilityFilters } from '@/views/hooks/useGetRecordGroupVisibilityFilters';
import {
  computeRecordGqlOperationFilter,
  isDefined,
  turnAnyFieldFilterIntoRecordGqlFilter,
} from 'twenty-shared/utils';

export const useGetRecordIndexTotalCount = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const currentRecordFilterGroups = useAtomComponentStateValue(
    currentRecordFilterGroupsComponentState,
  );

  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );

  const { filterValueDependencies } = useFilterValueDependencies();

  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );

  const { recordFilters: recordGroupsVisibilityFilter, recordGroupGqlFilter } =
    useGetRecordGroupVisibilityFilters();

  const computedFilter = computeRecordGqlOperationFilter({
    filterValueDependencies,
    recordFilters: [...currentRecordFilters, ...recordGroupsVisibilityFilter],
    recordFilterGroups: currentRecordFilterGroups,
    fieldMetadataItems: flattenedFieldMetadataItems,
  });

  const filter = isDefined(recordGroupGqlFilter)
    ? { and: [computedFilter, recordGroupGqlFilter] }
    : computedFilter;

  const anyFieldFilterValue = useAtomComponentStateValue(
    anyFieldFilterValueComponentState,
  );

  const { recordGqlOperationFilter: anyFieldFilter } =
    turnAnyFieldFilterIntoRecordGqlFilter({
      fields: objectMetadataItem.fields,
      filterValue: anyFieldFilterValue,
    });

  const { data, loading } = useAggregateRecords<{
    id: { COUNT: number };
  }>({
    objectNameSingular: objectMetadataItem.nameSingular,
    filter: { ...filter, ...anyFieldFilter },
    recordGqlFieldsAggregate: {
      id: [AggregateOperations.COUNT],
    },
  });

  const totalCount = data?.id?.COUNT;

  return {
    totalCount,
    loading,
  };
};
