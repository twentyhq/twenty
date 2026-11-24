import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { type CoreWorkflowReadCaller } from 'src/engine/core-modules/workflow/types/core-workflow-read-caller.type';
import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';
import { isPrivatableEntityVisibleToCaller } from 'src/engine/permissions/metadata-permissions/utils/is-privatable-entity-visible-to-caller.util';

export const isFlatWorkflowVisibleToCaller = ({
  flatWorkflow,
  callerApplication,
  workspaceCustomApplicationId,
}: CoreWorkflowReadCaller & {
  flatWorkflow: Pick<
    FlatWorkflow,
    'isPrivate' | 'createdByUserWorkspaceId' | 'applicationId'
  >;
}): boolean =>
  isPrivatableEntityVisibleToCaller({ privatableEntity: flatWorkflow }) &&
  canCallerReachApplication({
    callingApplication: callerApplication,
    applicationId: flatWorkflow.applicationId,
    operation: 'read',
    workspaceCustomApplicationId,
  });
