import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { useIncrementalUpdateManyRecords } from '@/object-record/hooks/useIncrementalUpdateManyRecords';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';

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

  const contextStoreTargetedRecordsRule = useAtomComponentValue(
    contextStoreTargetedRecordsRuleComponentState,
    contextStoreInstanceId,
  );

  const contextStoreFilters = useAtomComponentValue(
    contextStoreFiltersComponentState,
    contextStoreInstanceId,
  );

  const contextStoreFilterGroups = useAtomComponentValue(
    contextStoreFilterGroupsComponentState,
    contextStoreInstanceId,
  );

  const contextStoreAnyFieldFilterValue = useAtomComponentValue(
    contextStoreAnyFieldFilterValueComponentState,
    contextStoreInstanceId,
  );

  const { filterValueDependencies } = useFilterValueDependencies();

  const graphqlFilter = computeContextStoreFilters({
    contextStoreTargetedRecordsRule,
    contextStoreFilters,
    contextStoreFilterGroups,
    objectMetadataItem,
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

  const updateRecords = async (fieldsToUpdate: Record<string, any>) => {
    const count = await incrementalUpdateManyRecords(fieldsToUpdate);
    return count;
  };

  return {
    updateRecords,
    isUpdating,
    progress,
    cancel,
  };
};
