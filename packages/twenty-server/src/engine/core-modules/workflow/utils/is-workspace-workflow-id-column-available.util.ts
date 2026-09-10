import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { UpgradeAwareRepositoryState } from 'src/engine/twenty-orm/upgrade-aware/upgrade-aware-repository-state';

export const isWorkspaceWorkflowIdColumnAvailable = (): boolean =>
  !UpgradeAwareRepositoryState.getInstance()
    .getHiddenColumnPropertyNames(WorkflowEntity)
    .has('workspaceWorkflowId');
