import { WorkflowStatus } from 'src/engine/core-modules/workflow/enums/workflow-status.enum';

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
