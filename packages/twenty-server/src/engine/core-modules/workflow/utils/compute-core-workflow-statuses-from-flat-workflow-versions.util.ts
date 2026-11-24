import { WorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { type WorkflowStatus } from 'src/engine/core-modules/workflow/enums/workflow-status.enum';
import { computeCoreWorkflowStatuses } from 'src/engine/core-modules/workflow/utils/compute-core-workflow-statuses.util';
import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';

export const computeCoreWorkflowStatusesFromFlatWorkflowVersions = (
  flatWorkflowVersions: Pick<FlatWorkflowVersion, 'status'>[],
): WorkflowStatus[] => {
  const hasVersionWithStatus = (status: WorkflowVersionStatus) =>
    flatWorkflowVersions.some(
      (flatWorkflowVersion) => flatWorkflowVersion.status === status,
    );

  return computeCoreWorkflowStatuses({
    hasDraftVersion: hasVersionWithStatus(WorkflowVersionStatus.DRAFT),
    hasActiveVersion: hasVersionWithStatus(WorkflowVersionStatus.ACTIVE),
    hasDeactivatedVersion: hasVersionWithStatus(
      WorkflowVersionStatus.DEACTIVATED,
    ),
  });
};
