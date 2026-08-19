import { WorkflowStatus } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

// Same semantics and order as WorkflowStatusesUpdateJob.computeWorkflowStatuses,
// so the core page shows what the workspace record index shows
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

  if (hasDeactivatedVersion) {
    statuses.push(WorkflowStatus.DEACTIVATED);
  }

  return statuses;
};
