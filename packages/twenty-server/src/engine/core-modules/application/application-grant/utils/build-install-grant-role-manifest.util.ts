import {
  materializeRoleManifestObjectPermissions,
  OBJECT_PERMISSION_ACTIONS,
  ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION,
  type RoleManifest,
} from 'twenty-shared/application';

// The admin decides object access at install; everything else (settings, tools, flags) stays as requested
export const buildInstallGrantRoleManifest = ({
  requestedRoleManifest,
  customizedGrantRoleManifest,
}: {
  requestedRoleManifest: RoleManifest;
  customizedGrantRoleManifest: RoleManifest;
}): RoleManifest => {
  const { objectPermissions } = materializeRoleManifestObjectPermissions(
    customizedGrantRoleManifest,
  );

  return {
    ...requestedRoleManifest,
    ...Object.fromEntries(
      OBJECT_PERMISSION_ACTIONS.map((action) => {
        const roleLevelFlag = ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION[action];

        return [roleLevelFlag, customizedGrantRoleManifest[roleLevelFlag] ?? false];
      }),
    ),
    objectPermissions,
    fieldPermissions: [],
    rowLevelPermissionPredicates: [],
    rowLevelPermissionPredicateGroups: [],
  };
};
