import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { DEFAULT_QUERY_PAGE_SIZE } from '@/object-record/constants/DefaultQueryPageSize';
import { useLazyFetchAllRecords } from '@/object-record/hooks/useLazyFetchAllRecords';
import { useRetryWorkflowRun } from '@/workflow/hooks/useRetryWorkflowRun';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const RetryWorkflowRunSingleRecordCommand = () => {
  const { targetedRecordsRule, graphqlFilter } = useHeadlessCommandContextApi();

  const { fetchAllRecords: fetchAllRecordIds } = useLazyFetchAllRecords({
    objectNameSingular: CoreObjectNameSingular.WorkflowRun,
    filter: isDefined(graphqlFilter) ? graphqlFilter : undefined,
    limit: DEFAULT_QUERY_PAGE_SIZE,
    recordGqlFields: { id: true },
  });

  const { retryWorkflowRun } = useRetryWorkflowRun();

  const handleExecute = async () => {
    if (targetedRecordsRule.mode === 'selection') {
      for (const selectedRecordId of targetedRecordsRule.selectedRecordIds) {
        await retryWorkflowRun(selectedRecordId);
      }
    } else {
      const records = await fetchAllRecordIds();

      for (const record of records) {
        await retryWorkflowRun(record.id);
      }
    }
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
