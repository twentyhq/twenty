import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { useAggregateRecords } from '@/object-record/hooks/useAggregateRecords';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { augmentFieldsWithRelationTargets } from '@/object-record/record-filter/utils/augmentFieldsWithRelationTargets';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useGetViewGroupsFilters } from '@/views/hooks/useGetViewGroupsFilters';
import {
  computeRecordGqlOperationFilter,
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

  const recordGroupsVisibilityFilter = useGetViewGroupsFilters();

  const filter = computeRecordGqlOperationFilter({
    filterValueDependencies,
    recordFilters: [...currentRecordFilters, ...recordGroupsVisibilityFilter],
    recordFilterGroups: currentRecordFilterGroups,
    fields: augmentFieldsWithRelationTargets({
      baseFields: objectMetadataItem.fields,
      recordFilters: [...currentRecordFilters, ...recordGroupsVisibilityFilter],
      allFieldMetadataItems: flattenedFieldMetadataItems,
    }),
  });

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
