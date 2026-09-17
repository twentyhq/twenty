import { type RoleConfig } from '@/sdk/define/roles/role-config';
import {
  getFieldPermissionUniversalIdentifier,
  getObjectPermissionUniversalIdentifier,
  type RoleManifest,
} from 'twenty-shared/application';

export const fromRoleConfigToRoleManifest = ({
  roleConfig,
  applicationUniversalIdentifier,
}: {
  roleConfig: RoleConfig;
  applicationUniversalIdentifier: string;
}): RoleManifest => {
  return {
    ...roleConfig,
    objectPermissions: (roleConfig.objectPermissions ?? []).map(
      (objectPermission) => ({
        ...objectPermission,
        universalIdentifier:
          objectPermission.universalIdentifier ??
          getObjectPermissionUniversalIdentifier({
            applicationUniversalIdentifier,
            roleUniversalIdentifier: roleConfig.universalIdentifier,
            objectUniversalIdentifier:
              objectPermission.objectUniversalIdentifier,
          }),
      }),
    ),
    fieldPermissions: (roleConfig.fieldPermissions ?? []).map(
      (fieldPermission) => ({
        ...fieldPermission,
        universalIdentifier:
          fieldPermission.universalIdentifier ??
          getFieldPermissionUniversalIdentifier({
            applicationUniversalIdentifier,
            roleUniversalIdentifier: roleConfig.universalIdentifier,
            fieldUniversalIdentifier: fieldPermission.fieldUniversalIdentifier,
          }),
      }),
    ),
    rowLevelPermissionPredicateGroups:
      roleConfig.rowLevelPermissionPredicateGroups ?? [],
    rowLevelPermissionPredicates:
      roleConfig.rowLevelPermissionPredicates ?? [],
    permissionFlagUniversalIdentifiers:
      roleConfig.permissionFlagUniversalIdentifiers ?? [],
  };
};
