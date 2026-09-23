import {
  type AgentManifest,
  getRoleManifestGrantsNotCoveredBy,
  type ObjectManifest,
  type PermissionFlagManifest,
  type RoleManifest,
  type RoleManifestGrant,
} from 'twenty-shared/application';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

const OBJECT_ACTION_LABELS = {
  canReadObjectRecords: 'read',
  canUpdateObjectRecords: 'update',
  canSoftDeleteObjectRecords: 'soft-delete',
  canDestroyObjectRecords: 'destroy',
} as const;

const SYSTEM_PERMISSION_FLAG_KEY_BY_UNIVERSAL_IDENTIFIER = Object.fromEntries(
  Object.entries(SystemPermissionFlag).map(([key, universalIdentifier]) => [
    universalIdentifier,
    key,
  ]),
);

const STANDARD_OBJECT_NAME_BY_UNIVERSAL_IDENTIFIER = Object.fromEntries(
  Object.entries(STANDARD_OBJECTS).map(([name, { universalIdentifier }]) => [
    universalIdentifier,
    name,
  ]),
);

const describeGrant = ({
  grant,
  objects,
  permissionFlags,
}: {
  grant: RoleManifestGrant;
  objects: ObjectManifest[];
  permissionFlags: PermissionFlagManifest[];
}): string => {
  const describeObject = (objectUniversalIdentifier: string) =>
    objects.find(
      (object) => object.universalIdentifier === objectUniversalIdentifier,
    )?.nameSingular ??
    STANDARD_OBJECT_NAME_BY_UNIVERSAL_IDENTIFIER[objectUniversalIdentifier] ??
    objectUniversalIdentifier;

  switch (grant.type) {
    case 'ALL_OBJECT_RECORDS':
      return `${OBJECT_ACTION_LABELS[grant.action]} all object records`;
    case 'ALL_SETTINGS':
      return grant.flag === 'canUpdateAllSettings'
        ? 'update all settings'
        : 'access all tools';
    case 'PERMISSION_FLAG': {
      const flagKey =
        permissionFlags.find(
          (flag) =>
            flag.universalIdentifier ===
            grant.permissionFlagUniversalIdentifier,
        )?.key ??
        SYSTEM_PERMISSION_FLAG_KEY_BY_UNIVERSAL_IDENTIFIER[
          grant.permissionFlagUniversalIdentifier
        ] ??
        grant.permissionFlagUniversalIdentifier;

      return `permission flag ${flagKey}`;
    }
    case 'OBJECT_RECORDS':
      return `${OBJECT_ACTION_LABELS[grant.action]} ${describeObject(grant.objectUniversalIdentifier)} records`;
    case 'FIELD_VALUE':
      return `${grant.action === 'canReadFieldValue' ? 'read' : 'update'} field ${grant.fieldUniversalIdentifier} of ${describeObject(grant.objectUniversalIdentifier)}`;
    case 'ROW_LEVEL_RESTRICTION':
      return `${describeObject(grant.objectUniversalIdentifier)} records without the row-level restriction`;
  }
};

// The application role is what a workspace reviews when installing the app,
// so a role an agent runs with must not reach beyond it.
export const validateAgentRolesWithinApplicationRole = ({
  agents,
  roles,
  objects,
  permissionFlags,
  defaultRoleUniversalIdentifier,
}: {
  agents: AgentManifest[];
  roles: RoleManifest[];
  objects: ObjectManifest[];
  permissionFlags: PermissionFlagManifest[];
  defaultRoleUniversalIdentifier: string;
}): string[] => {
  const applicationRole = roles.find(
    (role) => role.universalIdentifier === defaultRoleUniversalIdentifier,
  );

  if (!isDefined(applicationRole)) {
    return [];
  }

  const errors: string[] = [];
  const toolPermissionFlagUniversalIdentifiers = permissionFlags
    .filter((flag) => flag.permissionType === 'tool')
    .map((flag) => flag.universalIdentifier);

  const agentNamesByRoleUniversalIdentifier = new Map<string, string[]>();

  for (const agent of agents) {
    if (
      !isDefined(agent.roleUniversalIdentifier) ||
      agent.roleUniversalIdentifier === defaultRoleUniversalIdentifier
    ) {
      continue;
    }

    agentNamesByRoleUniversalIdentifier.set(agent.roleUniversalIdentifier, [
      ...(agentNamesByRoleUniversalIdentifier.get(
        agent.roleUniversalIdentifier,
      ) ?? []),
      agent.name,
    ]);
  }

  for (const [
    roleUniversalIdentifier,
    agentNames,
  ] of agentNamesByRoleUniversalIdentifier) {
    const agentRole = roles.find(
      (role) => role.universalIdentifier === roleUniversalIdentifier,
    );
    const agentList = agentNames.map((name) => `"${name}"`).join(', ');

    if (!isDefined(agentRole)) {
      errors.push(
        `Agent ${agentList} references role "${roleUniversalIdentifier}", which is not defined by this application.`,
      );
      continue;
    }

    const uncoveredGrants = getRoleManifestGrantsNotCoveredBy({
      role: agentRole,
      superset: applicationRole,
      toolPermissionFlagUniversalIdentifiers,
    });

    if (uncoveredGrants.length === 0) {
      continue;
    }

    const grantList = uncoveredGrants
      .map((grant) => describeGrant({ grant, objects, permissionFlags }))
      .join(', ');

    errors.push(
      `Role "${agentRole.label}" used by agent ${agentList} grants more than the application role "${applicationRole.label}": ${grantList}. The application role must cover every permission an agent role grants.`,
    );
  }

  return errors;
};
