import { type WorkflowVersionStatus } from '@/workflow/types/Workflow';
import { type TagColor } from 'twenty-ui/components';

export const getWorkflowVersionStatusTagProps = ({
  workflowVersionStatus,
}: {
  workflowVersionStatus: WorkflowVersionStatus;
}): { color: TagColor; text: string } => {
  if (workflowVersionStatus === 'ARCHIVED') {
    return {
      color: 'gray',
      text: 'Archived',
    };
  }

  if (workflowVersionStatus === 'DRAFT') {
    return {
      color: 'yellow',
      text: 'Draft',
    };
  }

  if (workflowVersionStatus === 'ACTIVE') {
    return {
      color: 'green',
      text: 'Active',
    };
  }

  return {
    color: 'gray',
    text: 'Deactivated',
  };
};
