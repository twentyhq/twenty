import {
  getRoleManifestGrantsNotCoveredBy,
  type RoleManifest,
  type RoleManifestGrant,
} from 'twenty-shared/application';

const toGrantKey = (grant: RoleManifestGrant): string => JSON.stringify(grant);

const withoutRestrictions = (roleManifest: RoleManifest): RoleManifest => ({
  ...roleManifest,
  fieldPermissions: [],
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
});

// Pending = what the request asks for that the admin has neither approved nor added
export const computeGrantPendingPermissions = ({
  requestedRoleManifest,
  approvedRoleManifest,
  grantRoleManifest,
}: {
  requestedRoleManifest: RoleManifest;
  approvedRoleManifest: RoleManifest;
  grantRoleManifest: RoleManifest;
}): RoleManifestGrant[] => {
  const notApproved = getRoleManifestGrantsNotCoveredBy({
    role: requestedRoleManifest,
    superset: withoutRestrictions(approvedRoleManifest),
    toolPermissionFlagUniversalIdentifiers: [],
  });

  const notInGrantKeys = new Set(
    getRoleManifestGrantsNotCoveredBy({
      role: requestedRoleManifest,
      superset: withoutRestrictions(grantRoleManifest),
      toolPermissionFlagUniversalIdentifiers: [],
    }).map(toGrantKey),
  );

  return notApproved.filter((grant) => notInGrantKeys.has(toGrantKey(grant)));
};

// What the previously approved request had that the new request no longer asks for
export const computeGrantNarrowedPermissions = ({
  requestedRoleManifest,
  approvedRoleManifest,
}: {
  requestedRoleManifest: RoleManifest;
  approvedRoleManifest: RoleManifest;
}): RoleManifestGrant[] =>
  getRoleManifestGrantsNotCoveredBy({
    role: withoutRestrictions(approvedRoleManifest),
    superset: withoutRestrictions(requestedRoleManifest),
    toolPermissionFlagUniversalIdentifiers: [],
  });
