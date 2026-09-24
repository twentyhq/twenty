import { WorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';

export const getCoreWorkflowCurrentVersion = <
  TCoreWorkflowVersion extends { id: string; status: WorkflowVersionStatus },
>({
  versionsByRecency,
  lastPublishedCoreWorkflowVersionId,
}: {
  versionsByRecency: TCoreWorkflowVersion[];
  lastPublishedCoreWorkflowVersionId: string | null | undefined;
}): TCoreWorkflowVersion | undefined =>
  versionsByRecency.find(
    ({ status }) => status === WorkflowVersionStatus.DRAFT,
  ) ??
  versionsByRecency.find(
    ({ status }) => status === WorkflowVersionStatus.ACTIVE,
  ) ??
  versionsByRecency.find(
    ({ id }) => id === lastPublishedCoreWorkflowVersionId,
  ) ??
  versionsByRecency[0];
