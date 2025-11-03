import { type WorkflowRunStatus } from '@/workflow/types/Workflow';
import { type TagColor } from 'twenty-ui/components';

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

  if (workflowRunStatus === 'STOPPING') {
    return {
      color: 'orange',
      text: 'Stopping',
    };
  }

  if (workflowRunStatus === 'STOPPED') {
    return {
      color: 'gray',
      text: 'Stopped',
    };
  }

  return {
    color: 'red',
    text: 'Failed',
  };
};
