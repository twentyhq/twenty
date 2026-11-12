import { type RoleConfig } from '@/app/manifest/types/role-config.type';
import {
  getObjectPermissionUniversalIdentifier,
  normalizeRoleManifestRecordsPermissions,
  type RoleManifest,
} from 'twenty-shared/application';

export const fromRoleConfigToRoleManifest = ({
  roleConfig,
  applicationUniversalIdentifier,
}: {
  roleConfig: RoleConfig;
  applicationUniversalIdentifier: string;
}): RoleManifest => {
  const { recordsPermissions, ...role } =
    normalizeRoleManifestRecordsPermissions({
      role: roleConfig,
      applicationUniversalIdentifier,
    });

  return {
    ...role,
    recordsPermissions: {
      ...recordsPermissions,
      objects: recordsPermissions.objects.map((objectRecordsPermissions) => ({
        ...objectRecordsPermissions,
        universalIdentifier:
          objectRecordsPermissions.universalIdentifier ??
          getObjectPermissionUniversalIdentifier({
            applicationUniversalIdentifier,
            roleUniversalIdentifier: roleConfig.universalIdentifier,
            objectUniversalIdentifier:
              objectRecordsPermissions.objectUniversalIdentifier,
          }),
      })),
    },
    permissionFlagUniversalIdentifiers:
      roleConfig.permissionFlagUniversalIdentifiers ?? [],
  };
};
