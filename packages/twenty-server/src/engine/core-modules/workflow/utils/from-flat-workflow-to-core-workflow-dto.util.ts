import { type CoreWorkflowDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow.dto';
import { type WorkflowStatus } from 'src/engine/core-modules/workflow/enums/workflow-status.enum';
import { canChangeCoreWorkflowVisibility } from 'src/engine/core-modules/workflow/utils/can-change-core-workflow-visibility.util';
import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';
import { getCallerUserWorkspaceId } from 'src/engine/permissions/metadata-permissions/utils/get-caller-user-workspace-id.util';

export const fromFlatWorkflowToCoreWorkflowDto = ({
  flatWorkflow,
  statuses,
}: {
  flatWorkflow: FlatWorkflow;
  statuses: WorkflowStatus[];
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
    userWorkspaceId: getCallerUserWorkspaceId(),
  }),
  createdAt: flatWorkflow.createdAt,
  updatedAt: flatWorkflow.updatedAt,
});
