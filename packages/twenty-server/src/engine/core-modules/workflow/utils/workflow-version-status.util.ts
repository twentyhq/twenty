import { WorkflowVersionStatus as CoreWorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkflowVersionStatus as WorkspaceWorkflowVersionStatus } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

const CORE_STATUS_BY_WORKSPACE_STATUS: Record<
  WorkspaceWorkflowVersionStatus,
  CoreWorkflowVersionStatus
> = {
  [WorkspaceWorkflowVersionStatus.DRAFT]: CoreWorkflowVersionStatus.DRAFT,
  [WorkspaceWorkflowVersionStatus.ACTIVE]: CoreWorkflowVersionStatus.ACTIVE,
  [WorkspaceWorkflowVersionStatus.DEACTIVATED]:
    CoreWorkflowVersionStatus.DEACTIVATED,
  [WorkspaceWorkflowVersionStatus.ARCHIVED]: CoreWorkflowVersionStatus.ARCHIVED,
};

export const toCoreWorkflowVersionStatus = (
  status: WorkspaceWorkflowVersionStatus,
): CoreWorkflowVersionStatus => CORE_STATUS_BY_WORKSPACE_STATUS[status];
