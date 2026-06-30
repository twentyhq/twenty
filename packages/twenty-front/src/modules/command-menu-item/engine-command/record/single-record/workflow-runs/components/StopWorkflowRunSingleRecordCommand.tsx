import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useExecuteWorkflowRunBulkCommand } from '@/command-menu-item/engine-command/record/single-record/workflow-runs/hooks/useExecuteWorkflowRunBulkCommand';
import { useStopWorkflowRun } from '@/workflow/hooks/useStopWorkflowRun';

export const StopWorkflowRunSingleRecordCommand = () => {
  const { stopWorkflowRun } = useStopWorkflowRun();

  const { execute } = useExecuteWorkflowRunBulkCommand(stopWorkflowRun);

  return <HeadlessEngineCommandWrapperEffect execute={execute} />;
};
