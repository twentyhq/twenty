import {
  getOwnObjectPermissions,
  type Manifest,
  type RoleManifest,
} from 'twenty-shared/application';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

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
      ...getOwnObjectPermissions({
        roleManifest: requestedRole,
        ownObjectUniversalIdentifiers: manifest.objects.map(
          (objectManifest) => objectManifest.universalIdentifier,
        ),
      }),
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
