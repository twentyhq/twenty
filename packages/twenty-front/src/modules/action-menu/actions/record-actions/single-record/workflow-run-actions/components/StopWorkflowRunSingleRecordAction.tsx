import { Action } from '@/action-menu/actions/components/Action';
import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { DEFAULT_QUERY_PAGE_SIZE } from '@/object-record/constants/DefaultQueryPageSize';
import { useLazyFetchAllRecords } from '@/object-record/hooks/useLazyFetchAllRecords';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useRecordIndexIdFromCurrentContextStore } from '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useStopWorkflowRun } from '@/workflow/hooks/useStopWorkflowRun';

export const StopWorkflowRunSingleRecordAction = () => {
  const { objectMetadataItem, recordIndexId } =
    useRecordIndexIdFromCurrentContextStore();

  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
    recordIndexId,
  );

  const contextStoreFilters = useAtomComponentStateValue(
    contextStoreFiltersComponentState,
    recordIndexId,
  );

  const contextStoreFilterGroups = useAtomComponentStateValue(
    contextStoreFilterGroupsComponentState,
    recordIndexId,
  );

  const contextStoreAnyFieldFilterValue = useAtomComponentStateValue(
    contextStoreAnyFieldFilterValueComponentState,
    recordIndexId,
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

  const { fetchAllRecords: fetchAllRecordIds } = useLazyFetchAllRecords({
    objectNameSingular: CoreObjectNameSingular.WorkflowRun,
    filter: graphqlFilter,
    limit: DEFAULT_QUERY_PAGE_SIZE,
    recordGqlFields: { id: true },
  });

  const { stopWorkflowRun } = useStopWorkflowRun();

  const handleClick = async () => {
    if (contextStoreTargetedRecordsRule.mode === 'selection') {
      for (const selectedRecordId of contextStoreTargetedRecordsRule.selectedRecordIds) {
        await stopWorkflowRun(selectedRecordId);
      }
    } else {
      const records = await fetchAllRecordIds();

      for (const record of records) {
        await stopWorkflowRun(record.id);
      }
    }
  };

  return <Action onClick={handleClick} />;
};
