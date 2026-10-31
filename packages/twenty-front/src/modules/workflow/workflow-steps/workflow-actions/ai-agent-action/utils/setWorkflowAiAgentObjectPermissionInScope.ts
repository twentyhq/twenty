import { type AiRunScope } from 'twenty-shared/ai';

import { type WorkflowAiAgentCrudObjectPermission } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/types/WorkflowAiAgentCrudObjectPermission';

// an object left with no action is dropped, so the scope only names what the step may do
export const setWorkflowAiAgentObjectPermissionInScope = ({
  scope,
  objectUniversalIdentifier,
  objectPermission,
}: {
  scope: AiRunScope | undefined;
  objectUniversalIdentifier: string;
  objectPermission: WorkflowAiAgentCrudObjectPermission;
}): AiRunScope => {
  const otherObjectPermissions = (scope?.objectPermissions ?? []).filter(
    (existingObjectPermission) =>
      existingObjectPermission.objectUniversalIdentifier !==
      objectUniversalIdentifier,
  );
  const actions = {
    canReadObjectRecords: objectPermission.canReadObjectRecords,
    canUpdateObjectRecords: objectPermission.canUpdateObjectRecords,
    canSoftDeleteObjectRecords: objectPermission.canSoftDeleteObjectRecords,
    canDestroyObjectRecords: objectPermission.canDestroyObjectRecords,
  };
  const hasAnyAction = Object.values(actions).some(Boolean);

  return {
    ...scope,
    objectPermissions: hasAnyAction
      ? [...otherObjectPermissions, { objectUniversalIdentifier, ...actions }]
      : otherObjectPermissions,
  };
};
