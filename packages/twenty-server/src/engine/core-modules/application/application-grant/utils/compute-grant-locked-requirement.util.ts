import {
  getRoleManifestGrantsNotCoveredBy,
  OBJECT_PERMISSION_ACTIONS,
  ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION,
  type RoleManifest,
  type RoleManifestGrant,
} from 'twenty-shared/application';

import { materializeRoleManifestObjectPermissions } from 'src/engine/core-modules/application/application-grant/utils/materialize-role-manifest-object-permissions.util';

// The minimum a grant must keep: the approved request, minus the "all objects" switches whose scope the admin decides
export const computeGrantLockedRequirement = (
  approvedRoleManifest: RoleManifest,
): RoleManifest => ({
  ...materializeRoleManifestObjectPermissions(approvedRoleManifest),
  ...Object.fromEntries(
    OBJECT_PERMISSION_ACTIONS.map((action) => [
      ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION[action],
      false,
    ]),
  ),
  fieldPermissions: [],
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
});

export const computeGrantMissingLockedPermissions = ({
  approvedRoleManifest,
  grantRoleManifest,
}: {
  approvedRoleManifest: RoleManifest;
  grantRoleManifest: RoleManifest;
}): RoleManifestGrant[] =>
  getRoleManifestGrantsNotCoveredBy({
    role: computeGrantLockedRequirement(approvedRoleManifest),
    superset: {
      ...grantRoleManifest,
      fieldPermissions: [],
      rowLevelPermissionPredicates: [],
      rowLevelPermissionPredicateGroups: [],
    },
    toolPermissionFlagUniversalIdentifiers: [],
  });
