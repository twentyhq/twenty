import { type WorkflowRunStatus } from '@/workflow/types/Workflow';
import { t } from '@lingui/core/macro';
import { type TagColor } from 'twenty-ui/primitives/data-display';

export const getWorkflowRunStatusTagProps = ({
  workflowRunStatus,
}: {
  workflowRunStatus: WorkflowRunStatus;
}): { color: TagColor; text: string } => {
  if (workflowRunStatus === 'NOT_STARTED') {
    return {
      color: 'gray',
      text: t`Not started`,
    };
  }

  if (workflowRunStatus === 'RUNNING') {
    return {
      color: 'yellow',
      text: t`Running`,
    };
  }

  if (workflowRunStatus === 'COMPLETED') {
    return {
      color: 'green',
      text: t`Completed`,
    };
  }

  if (workflowRunStatus === 'ENQUEUED') {
    return {
      color: 'blue',
      text: t`Enqueued`,
    };
  }

  if (workflowRunStatus === 'STOPPING') {
    return {
      color: 'orange',
      text: t`Stopping`,
    };
  }

  if (workflowRunStatus === 'STOPPED') {
    return {
      color: 'gray',
      text: t`Stopped`,
    };
  }

  return {
    color: 'red',
    text: t`Failed`,
  };
};
