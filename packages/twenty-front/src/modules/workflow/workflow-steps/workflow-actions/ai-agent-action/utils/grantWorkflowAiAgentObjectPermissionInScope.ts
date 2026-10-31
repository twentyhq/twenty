import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { type AiRunScope } from 'twenty-shared/ai';

// reading is always set on the entry, so no all-objects change can leave the granted action without it
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

  return {
    ...scope,
    objectPermissions: [
      ...objectPermissions.filter(
        (objectPermission) => objectPermission !== existingObjectPermission,
      ),
      {
        ...existingObjectPermission,
        objectUniversalIdentifier,
        canReadObjectRecords: true,
        [permissionKey]: true,
      },
    ],
  };
};
