import { WorkflowStatus } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

// Shared with WorkflowStatusesUpdateJob so the core page and the workspace
// statuses field cannot drift
export const computeCoreWorkflowStatuses = ({
  hasDraftVersion,
  hasActiveVersion,
  hasDeactivatedVersion,
}: {
  hasDraftVersion: boolean;
  hasActiveVersion: boolean;
  hasDeactivatedVersion: boolean;
}): WorkflowStatus[] => {
  const statuses: WorkflowStatus[] = [];

  if (hasDraftVersion) {
    statuses.push(WorkflowStatus.DRAFT);
  }

  if (hasActiveVersion) {
    statuses.push(WorkflowStatus.ACTIVE);
  }

  if (!hasActiveVersion && hasDeactivatedVersion) {
    statuses.push(WorkflowStatus.DEACTIVATED);
  }

  return statuses;
};
