import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useAggregateRecords } from '@/object-record/hooks/useAggregateRecords';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { computeRecordGqlOperationFilter } from '@/object-record/record-filter/utils/computeViewRecordGqlOperationFilter';
import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const useGetRecordIndexTotalCount = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const currentRecordFilterGroups = useRecoilComponentValueV2(
    currentRecordFilterGroupsComponentState,
  );

  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const { filterValueDependencies } = useFilterValueDependencies();

  const filter = computeRecordGqlOperationFilter({
    filterValueDependencies,
    recordFilters: currentRecordFilters,
    recordFilterGroups: currentRecordFilterGroups,
    fields: objectMetadataItem.fields,
  });

  const { data, loading } = useAggregateRecords<{
    id: { COUNT: number };
  }>({
    objectNameSingular: objectMetadataItem.nameSingular,
    filter,
    recordGqlFieldsAggregate: {
      id: [AGGREGATE_OPERATIONS.count],
    },
  });

  const totalCount = data?.id?.COUNT;

  return {
    totalCount,
    loading,
  };
};
