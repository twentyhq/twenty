import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { UpgradeAwareRepositoryState } from 'src/engine/twenty-orm/upgrade-aware/upgrade-aware-repository-state';

export const isCoreWorkflowIdColumnAvailable = (): boolean =>
  !UpgradeAwareRepositoryState.getInstance()
    .getHiddenColumnPropertyNames(WorkflowVersionEntity)
    .has('coreWorkflowId');
