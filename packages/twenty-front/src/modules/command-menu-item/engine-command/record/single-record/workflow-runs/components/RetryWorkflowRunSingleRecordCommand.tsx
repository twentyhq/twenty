import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useExecuteWorkflowRunBulkCommand } from '@/command-menu-item/engine-command/record/single-record/workflow-runs/hooks/useExecuteWorkflowRunBulkCommand';
import { useRetryWorkflowRun } from '@/workflow/hooks/useRetryWorkflowRun';

export const RetryWorkflowRunSingleRecordCommand = () => {
  const { retryWorkflowRun } = useRetryWorkflowRun();

  const { execute } = useExecuteWorkflowRunBulkCommand(retryWorkflowRun);

  return <HeadlessEngineCommandWrapperEffect execute={execute} />;
};
