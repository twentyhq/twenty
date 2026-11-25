import { type CoreWorkflowDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow.dto';
import { type WorkflowStatus } from 'src/engine/core-modules/workflow/enums/workflow-status.enum';
import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';
import { canCallerChangePrivatableEntityPrivacy } from 'src/engine/permissions/metadata-permissions/utils/can-caller-change-privatable-entity-privacy.util';

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
  canChangeVisibility: canCallerChangePrivatableEntityPrivacy({
    privatableEntity: flatWorkflow,
  }),
  createdAt: flatWorkflow.createdAt,
  updatedAt: flatWorkflow.updatedAt,
});
