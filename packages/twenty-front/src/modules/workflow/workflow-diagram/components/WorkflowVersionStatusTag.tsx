import { WorkflowVersionStatus } from '@/workflow/types/Workflow';
import { Tag } from 'twenty-ui';

export const WorkflowVersionStatusTag = ({
  versionStatus,
}: {
  versionStatus: WorkflowVersionStatus;
}) => {
  if (versionStatus === 'ACTIVE') {
    return <Tag color="green" text="Active" />;
  }

  if (versionStatus === 'DRAFT') {
    return <Tag color="yellow" text="Draft" />;
  }

  if (versionStatus === 'ARCHIVED') {
    return <Tag color="gray" text="Archived" />;
  }

  return <Tag color="gray" text="Deactivated" />;
};
