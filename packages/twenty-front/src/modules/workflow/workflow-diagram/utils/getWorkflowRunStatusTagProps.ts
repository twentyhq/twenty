import { WorkflowRunStatus } from '@/workflow/types/Workflow';
import { TagColor } from 'twenty-ui/components';

export const getWorkflowRunStatusTagProps = ({
  workflowRunStatus,
}: {
  workflowRunStatus: WorkflowRunStatus;
}): { color: TagColor; text: string } => {
  if (workflowRunStatus === 'NOT_STARTED') {
    return {
      color: 'gray',
      text: 'Not started',
    };
  }

  if (workflowRunStatus === 'RUNNING') {
    return {
      color: 'yellow',
      text: 'Running',
    };
  }

  if (workflowRunStatus === 'COMPLETED') {
    return {
      color: 'green',
      text: 'Completed',
    };
  }

  if (workflowRunStatus === 'ENQUEUED') {
    return {
      color: 'blue',
      text: 'Enqueued',
    };
  }

  return {
    color: 'red',
    text: 'Failed',
  };
};
