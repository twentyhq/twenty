import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useStopWorkflowRun } from '@/workflow/hooks/useStopWorkflowRun';

export const StopWorkflowRunSingleRecordAction = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const { stopWorkflowRun } = useStopWorkflowRun();

  const handleClick = async () => {
    await stopWorkflowRun(recordId);
  };

  return <Action onClick={handleClick} />;
};
