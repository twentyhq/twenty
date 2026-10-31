import {
  type Manifest,
  type ObjectPermissionManifest,
  type RoleManifest,
} from 'twenty-shared/application';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

const buildOwnObjectPermissions = ({
  manifest,
  requestedRole,
}: {
  manifest: Manifest;
  requestedRole: RoleManifest;
}): ObjectPermissionManifest[] => {
  const declaredObjectUniversalIdentifiers = new Set(
    (requestedRole.objectPermissions ?? []).map(
      (objectPermission) => objectPermission.objectUniversalIdentifier,
    ),
  );

  return manifest.objects
    .filter(
      (objectManifest) =>
        !declaredObjectUniversalIdentifiers.has(
          objectManifest.universalIdentifier,
        ),
    )
    .map((objectManifest) => ({
      objectUniversalIdentifier: objectManifest.universalIdentifier,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: true,
      canDestroyObjectRecords: true,
    }));
};

export const findRequestedRoleManifest = (
  manifest: Manifest,
): RoleManifest | undefined =>
  manifest.roles.find(
    (role) =>
      role.universalIdentifier ===
      manifest.application.defaultRoleUniversalIdentifier,
  );

// A confined application's default role is a request: it requests its own objects with every
// action, carries no row-level rules, and is assigned to nothing (its agents run with the grant).
export const normalizeConfinedApplicationManifest = (
  manifest: Manifest,
): Manifest => {
  const requestedRole = findRequestedRoleManifest(manifest);

  if (!isDefined(requestedRole)) {
    return manifest;
  }

  if (
    isNonEmptyArray(requestedRole.rowLevelPermissionPredicates) ||
    isNonEmptyArray(requestedRole.rowLevelPermissionPredicateGroups)
  ) {
    throw new ApplicationException(
      `Application role "${requestedRole.label}" cannot declare row-level permission rules`,
      ApplicationExceptionCode.INVALID_INPUT,
    );
  }

  const normalizedRequestedRole: RoleManifest = {
    ...requestedRole,
    canBeAssignedToUsers: false,
    canBeAssignedToAgents: false,
    canBeAssignedToApiKeys: false,
    objectPermissions: [
      ...(requestedRole.objectPermissions ?? []),
      ...buildOwnObjectPermissions({ manifest, requestedRole }),
    ],
  };

  return {
    ...manifest,
    roles: manifest.roles.map((role) =>
      role.universalIdentifier === requestedRole.universalIdentifier
        ? normalizedRequestedRole
        : role,
    ),
    agents: (manifest.agents ?? []).map((agentManifest) =>
      agentManifest.roleUniversalIdentifier ===
      requestedRole.universalIdentifier
        ? { ...agentManifest, roleUniversalIdentifier: undefined }
        : agentManifest,
    ),
  };
};
