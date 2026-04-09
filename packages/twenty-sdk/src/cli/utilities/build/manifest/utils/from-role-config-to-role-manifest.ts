import { type RoleConfig } from '@/sdk/roles/role-config';
import { type RoleManifest } from 'twenty-shared/application';
import { v5 as uuidv5 } from 'uuid';

const ROLE_UNIVERSAL_IDENTIFIER_NAMESPACE =
  'b403ec59-4d80-4f22-85e6-717a192dc9cb';

export const fromRoleConfigToRoleManifest = (
  roleConfig: RoleConfig,
): RoleManifest => {
  return {
    ...roleConfig,
    objectPermissions: (roleConfig.objectPermissions ?? []).map(
      (objectPermission) => ({
        ...objectPermission,
        universalIdentifier: uuidv5(
          `${roleConfig.universalIdentifier}:${objectPermission.objectUniversalIdentifier}`,
          ROLE_UNIVERSAL_IDENTIFIER_NAMESPACE,
        ),
      }),
    ),
    fieldPermissions: (roleConfig.fieldPermissions ?? []).map(
      (fieldPermission) => ({
        ...fieldPermission,
        universalIdentifier: uuidv5(
          `${roleConfig.universalIdentifier}:${fieldPermission.objectUniversalIdentifier}:${fieldPermission.fieldUniversalIdentifier}`,
          ROLE_UNIVERSAL_IDENTIFIER_NAMESPACE,
        ),
      }),
    ),
    permissionFlags: (roleConfig.permissionFlags ?? []).map(
      (permissionFlag) => ({
        universalIdentifier: uuidv5(
          `${roleConfig.universalIdentifier}:${permissionFlag}`,
          ROLE_UNIVERSAL_IDENTIFIER_NAMESPACE,
        ),
        flag: permissionFlag,
      }),
    ),
  };
};
