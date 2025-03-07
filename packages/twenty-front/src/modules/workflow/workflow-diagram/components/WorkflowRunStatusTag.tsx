import { WorkflowRunStatus } from '@/workflow/types/Workflow';
import { Tag } from 'twenty-ui';

export const WorkflowRunStatusTag = ({
  workflowRunStatus,
}: {
  workflowRunStatus: WorkflowRunStatus;
}) => {
  if (workflowRunStatus === 'NOT_STARTED') {
    return <Tag color="gray" text="Not started" />;
  }

  if (workflowRunStatus === 'RUNNING') {
    return <Tag color="yellow" text="Running" />;
  }

  if (workflowRunStatus === 'COMPLETED') {
    return <Tag color="green" text="Completed" />;
  }

  return <Tag color="red" text="Failed" />;
};
