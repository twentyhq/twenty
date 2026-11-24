import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { type CoreWorkflowReader } from 'src/engine/core-modules/workflow/types/core-workflow-reader.type';
import { isCoreWorkflowVisibleToUser } from 'src/engine/core-modules/workflow/utils/is-core-workflow-visible-to-user.util';
import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';

export const isFlatWorkflowReadableByReader = ({
  flatWorkflow,
  userWorkspaceId,
  callerApplication,
  workspaceCustomApplicationId,
}: CoreWorkflowReader & {
  flatWorkflow: Pick<
    FlatWorkflow,
    'isPrivate' | 'createdByUserWorkspaceId' | 'applicationId'
  >;
}): boolean =>
  isCoreWorkflowVisibleToUser({
    isPrivate: flatWorkflow.isPrivate,
    createdByUserWorkspaceId: flatWorkflow.createdByUserWorkspaceId,
    userWorkspaceId,
  }) &&
  canCallerReachApplication({
    callingApplication: callerApplication,
    applicationId: flatWorkflow.applicationId,
    operation: 'read',
    workspaceCustomApplicationId,
  });
