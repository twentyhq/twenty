import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { DEFAULT_QUERY_PAGE_SIZE } from '@/object-record/constants/DefaultQueryPageSize';
import { useLazyFetchAllRecords } from '@/object-record/hooks/useLazyFetchAllRecords';
import { useStopWorkflowRun } from '@/workflow/hooks/useStopWorkflowRun';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const StopWorkflowRunSingleRecordCommand = () => {
  const { targetedRecordsRule, graphqlFilter } = useHeadlessCommandContextApi();

  const { fetchAllRecords: fetchAllRecordIds } = useLazyFetchAllRecords({
    objectNameSingular: CoreObjectNameSingular.WorkflowRun,
    filter: isDefined(graphqlFilter) ? graphqlFilter : undefined,
    limit: DEFAULT_QUERY_PAGE_SIZE,
    recordGqlFields: { id: true },
  });

  const { stopWorkflowRun } = useStopWorkflowRun();

  const handleExecute = async () => {
    if (targetedRecordsRule.mode === 'selection') {
      for (const selectedRecordId of targetedRecordsRule.selectedRecordIds) {
        await stopWorkflowRun(selectedRecordId);
      }
    } else {
      const records = await fetchAllRecordIds();

      for (const record of records) {
        await stopWorkflowRun(record.id);
      }
    }
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
