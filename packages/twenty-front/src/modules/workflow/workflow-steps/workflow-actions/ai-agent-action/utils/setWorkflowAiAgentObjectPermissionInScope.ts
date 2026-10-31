import { type AiRunScope } from 'twenty-shared/ai';

import { type WorkflowAiAgentCrudObjectPermission } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/types/WorkflowAiAgentCrudObjectPermission';
import { hasWorkflowAiAgentAllObjectsPermissionInScope } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/hasWorkflowAiAgentAllObjectsPermissionInScope';

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
  // without its entry the object would fall back to an all-objects grant, so the denial is kept
  const shouldKeepEntry =
    Object.values(actions).some(Boolean) ||
    hasWorkflowAiAgentAllObjectsPermissionInScope(scope);

  return {
    ...scope,
    objectPermissions: shouldKeepEntry
      ? [...otherObjectPermissions, { objectUniversalIdentifier, ...actions }]
      : otherObjectPermissions,
  };
};
