import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { fieldMetadataItemByIdMapSelector } from '@/object-metadata/states/fieldMetadataItemByIdMapSelector';
import { useIncrementalUpdateManyRecords } from '@/object-record/hooks/useIncrementalUpdateManyRecords';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type UseUpdateMultipleRecordsActionsProps = {
  objectNameSingular: string;
  contextStoreInstanceId: string;
};

export const useUpdateMultipleRecordsActions = ({
  objectNameSingular,
  contextStoreInstanceId,
}: UseUpdateMultipleRecordsActionsProps) => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow(
    contextStoreInstanceId,
  );

  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
    contextStoreInstanceId,
  );

  const contextStoreFilters = useAtomComponentStateValue(
    contextStoreFiltersComponentState,
    contextStoreInstanceId,
  );

  const contextStoreFilterGroups = useAtomComponentStateValue(
    contextStoreFilterGroupsComponentState,
    contextStoreInstanceId,
  );

  const contextStoreAnyFieldFilterValue = useAtomComponentStateValue(
    contextStoreAnyFieldFilterValueComponentState,
    contextStoreInstanceId,
  );

  const { filterValueDependencies } = useFilterValueDependencies();

  const fieldMetadataItemByIdMap = useAtomStateValue(
    fieldMetadataItemByIdMapSelector,
  );

  const graphqlFilter = computeContextStoreFilters({
    contextStoreTargetedRecordsRule,
    contextStoreFilters,
    contextStoreFilterGroups,
    objectMetadataItem,
    findFieldMetadataItemById: (id) => fieldMetadataItemByIdMap.get(id),
    filterValueDependencies,
    contextStoreAnyFieldFilterValue,
  });

  const {
    incrementalUpdateManyRecords,
    isProcessing: isUpdating,
    progress,
    cancel,
  } = useIncrementalUpdateManyRecords({
    objectNameSingular,
    filter: graphqlFilter,
  });

  return {
    updateRecords: incrementalUpdateManyRecords,
    isUpdating,
    progress,
    cancel,
  };
};
