import { type CoreWorkflowDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow.dto';
import { type WorkflowStatus } from 'src/engine/core-modules/workflow/enums/workflow-status.enum';
import { canChangeCoreWorkflowVisibility } from 'src/engine/core-modules/workflow/utils/can-change-core-workflow-visibility.util';
import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';

export const fromFlatWorkflowToCoreWorkflowDto = ({
  flatWorkflow,
  statuses,
  userWorkspaceId,
}: {
  flatWorkflow: FlatWorkflow;
  statuses: WorkflowStatus[];
  userWorkspaceId: string | undefined;
}): CoreWorkflowDTO => ({
  id: flatWorkflow.id,
  name: flatWorkflow.name,
  statuses,
  lastPublishedCoreWorkflowVersionId:
    flatWorkflow.lastPublishedCoreWorkflowVersionId,
  applicationId: flatWorkflow.applicationId,
  workspaceWorkflowId: flatWorkflow.workspaceWorkflowId,
  isSystem: flatWorkflow.isSystem,
  isPrivate: flatWorkflow.isPrivate,
  canChangeVisibility: canChangeCoreWorkflowVisibility({
    createdByUserWorkspaceId: flatWorkflow.createdByUserWorkspaceId,
    userWorkspaceId,
  }),
  createdAt: flatWorkflow.createdAt,
  updatedAt: flatWorkflow.updatedAt,
});
