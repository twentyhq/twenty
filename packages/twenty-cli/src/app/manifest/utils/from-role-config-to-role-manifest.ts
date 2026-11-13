import { type RoleConfig } from '@/app/manifest/types/role-config.type';
import {
  getFieldPermissionUniversalIdentifier,
  getObjectPermissionUniversalIdentifier,
  type LegacyCompliantRoleManifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

export const fromRoleConfigToRoleManifest = ({
  roleConfig,
  applicationUniversalIdentifier,
}: {
  roleConfig: RoleConfig;
  applicationUniversalIdentifier: string;
}): LegacyCompliantRoleManifest => {
  const { recordsPermissions } = roleConfig;

  if (isDefined(recordsPermissions)) {
    return {
      ...roleConfig,
      recordsPermissions: {
        ...recordsPermissions,
        ...(isDefined(recordsPermissions.objects)
          ? {
              objects: recordsPermissions.objects.map(
                (objectRecordsPermissions) => ({
                  ...objectRecordsPermissions,
                  universalIdentifier:
                    objectRecordsPermissions.universalIdentifier ??
                    getObjectPermissionUniversalIdentifier({
                      applicationUniversalIdentifier,
                      roleUniversalIdentifier: roleConfig.universalIdentifier,
                      objectUniversalIdentifier:
                        objectRecordsPermissions.objectUniversalIdentifier,
                    }),
                }),
              ),
            }
          : {}),
      },
      permissionFlagUniversalIdentifiers:
        roleConfig.permissionFlagUniversalIdentifiers ?? [],
    };
  }

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
    rowLevelPermissionPredicates: roleConfig.rowLevelPermissionPredicates ?? [],
    permissionFlagUniversalIdentifiers:
      roleConfig.permissionFlagUniversalIdentifiers ?? [],
  };
};
