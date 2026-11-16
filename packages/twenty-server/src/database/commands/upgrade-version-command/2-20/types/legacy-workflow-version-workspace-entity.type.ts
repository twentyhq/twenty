import { type BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export type LegacyWorkflowVersionStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'DEACTIVATED'
  | 'ARCHIVED';

export type LegacyWorkflowVersionWorkspaceEntity = BaseWorkspaceEntity & {
  name: string | null;
  trigger: WorkflowTrigger | null;
  steps: WorkflowAction[] | null;
  coreWorkflowVersionId: string | null;
  status: LegacyWorkflowVersionStatus;
  position: number;
  workflowId: string;
};
