import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

export type LegacyWorkflowVersionWorkspaceEntity =
  WorkflowVersionWorkspaceEntity & { workflowId: string };
