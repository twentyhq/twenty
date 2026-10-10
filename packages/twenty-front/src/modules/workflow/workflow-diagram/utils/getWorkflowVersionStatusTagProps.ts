import { type WorkflowVersionStatus } from '@/workflow/types/Workflow';
import { t } from '@lingui/core/macro';
import { type TagColor } from 'twenty-ui/primitives/data-display';

export const getWorkflowVersionStatusTagProps = ({
  workflowVersionStatus,
}: {
  workflowVersionStatus: WorkflowVersionStatus;
}): { color: TagColor; text: string } => {
  if (workflowVersionStatus === 'ARCHIVED') {
    return {
      color: 'gray',
      text: t`Archived`,
    };
  }

  if (workflowVersionStatus === 'DRAFT') {
    return {
      color: 'yellow',
      text: t`Draft`,
    };
  }

  if (workflowVersionStatus === 'ACTIVE') {
    return {
      color: 'green',
      text: t`Active`,
    };
  }

  return {
    color: 'gray',
    text: t`Deactivated`,
  };
};
