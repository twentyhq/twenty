import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { type AiRunScope } from 'twenty-shared/ai';

import { getWorkflowAiAgentEffectiveObjectPermission } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/getWorkflowAiAgentEffectiveObjectPermission';

// sets only the granted action, plus reading when it is not effective yet, so other actions keep their all-objects grant
export const grantWorkflowAiAgentObjectPermissionInScope = ({
  scope,
  objectUniversalIdentifier,
  permissionKey,
}: {
  scope: AiRunScope | undefined;
  objectUniversalIdentifier: string;
  permissionKey: SettingsRoleObjectPermissionKey;
}): AiRunScope => {
  const objectPermissions = scope?.objectPermissions ?? [];
  const existingObjectPermission = objectPermissions.find(
    (objectPermission) =>
      objectPermission.objectUniversalIdentifier === objectUniversalIdentifier,
  );
  const canReadObjectRecords = getWorkflowAiAgentEffectiveObjectPermission({
    scope,
    objectPermission: existingObjectPermission,
    permissionKey: 'canReadObjectRecords',
  });

  return {
    ...scope,
    objectPermissions: [
      ...objectPermissions.filter(
        (objectPermission) => objectPermission !== existingObjectPermission,
      ),
      {
        ...existingObjectPermission,
        objectUniversalIdentifier,
        ...(canReadObjectRecords ? {} : { canReadObjectRecords: true }),
        [permissionKey]: true,
      },
    ],
  };
};
