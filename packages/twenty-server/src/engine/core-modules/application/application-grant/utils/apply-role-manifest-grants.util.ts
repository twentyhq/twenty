import {
  type RoleManifest,
  type RoleManifestGrant,
  ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION,
} from 'twenty-shared/application';

import { upsertObjectPermissionInRoleManifest } from 'src/engine/core-modules/application/application-grant/utils/upsert-object-permission-in-role-manifest.util';

const applyRoleManifestGrant = ({
  roleManifest,
  grant,
  isGranted,
}: {
  roleManifest: RoleManifest;
  grant: RoleManifestGrant;
  isGranted: boolean;
}): RoleManifest => {
  switch (grant.type) {
    case 'ALL_OBJECT_RECORDS':
      return {
        ...roleManifest,
        [ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION[grant.action]]: isGranted,
      };
    case 'ALL_SETTINGS':
      return { ...roleManifest, canUpdateAllSettings: isGranted };
    case 'ALL_TOOLS':
      return { ...roleManifest, canAccessAllTools: isGranted };
    case 'PERMISSION_FLAG': {
      const otherFlags = (
        roleManifest.permissionFlagUniversalIdentifiers ?? []
      ).filter(
        (permissionFlagUniversalIdentifier) =>
          permissionFlagUniversalIdentifier !==
          grant.permissionFlagUniversalIdentifier,
      );

      return {
        ...roleManifest,
        permissionFlagUniversalIdentifiers: isGranted
          ? [...otherFlags, grant.permissionFlagUniversalIdentifier]
          : otherFlags,
      };
    }
    case 'OBJECT_RECORDS':
      // A removed action falls back to the role-level switch, which keeps an admin's "all objects" addition
      return upsertObjectPermissionInRoleManifest({
        roleManifest,
        objectUniversalIdentifier: grant.objectUniversalIdentifier,
        action: grant.action,
        value: isGranted ? true : null,
      });
    case 'FIELD_VALUE':
    case 'ROW_LEVEL_RESTRICTION':
      return roleManifest;
  }
};

const dropEmptyObjectPermissions = (roleManifest: RoleManifest): RoleManifest => ({
  ...roleManifest,
  objectPermissions: (roleManifest.objectPermissions ?? []).filter(
    (objectPermission) =>
      objectPermission.canReadObjectRecords !== undefined ||
      objectPermission.canUpdateObjectRecords !== undefined ||
      objectPermission.canSoftDeleteObjectRecords !== undefined ||
      objectPermission.canDestroyObjectRecords !== undefined,
  ),
});

export const addRoleManifestGrants = ({
  roleManifest,
  grants,
}: {
  roleManifest: RoleManifest;
  grants: RoleManifestGrant[];
}): RoleManifest =>
  grants.reduce(
    (accumulator, grant) =>
      applyRoleManifestGrant({
        roleManifest: accumulator,
        grant,
        isGranted: true,
      }),
    roleManifest,
  );

export const removeRoleManifestGrants = ({
  roleManifest,
  grants,
}: {
  roleManifest: RoleManifest;
  grants: RoleManifestGrant[];
}): RoleManifest =>
  dropEmptyObjectPermissions(
    grants.reduce(
      (accumulator, grant) =>
        applyRoleManifestGrant({
          roleManifest: accumulator,
          grant,
          isGranted: false,
        }),
      roleManifest,
    ),
  );
