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

type ObjectDescriptor = Pick<
  ObjectManifest,
  'universalIdentifier' | 'nameSingular'
>;

type PermissionFlagDescriptor = Pick<
  PermissionFlagManifest,
  'universalIdentifier' | 'key' | 'permissionType'
>;

type AgentNamesByRoleUniversalIdentifier = Map<string, string[]>;

const OBJECT_ACTION_LABELS = {
  canReadObjectRecords: 'read',
  canUpdateObjectRecords: 'update',
  canSoftDeleteObjectRecords: 'soft-delete',
  canDestroyObjectRecords: 'destroy',
} as const;

const buildSystemPermissionFlagNameByUniversalIdentifier = (
  systemPermissionFlag: Record<string, string>,
): Map<string, string> => {
  const nameByUniversalIdentifier = new Map<string, string>();

  for (const [name, universalIdentifier] of Object.entries(
    systemPermissionFlag,
  )) {
    if (!nameByUniversalIdentifier.has(universalIdentifier)) {
      nameByUniversalIdentifier.set(universalIdentifier, name);
    }
  }

  return nameByUniversalIdentifier;
};

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
  systemPermissionFlagNameByUniversalIdentifier,
}: {
  grant: RoleManifestGrant;
  objects: ObjectDescriptor[];
  permissionFlags: PermissionFlagDescriptor[];
  systemPermissionFlagNameByUniversalIdentifier: Map<string, string>;
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
      return 'update all settings';
    case 'ALL_TOOLS':
      return 'access all tools';
    case 'PERMISSION_FLAG': {
      const flagKey =
        permissionFlags.find(
          (flag) =>
            flag.universalIdentifier ===
            grant.permissionFlagUniversalIdentifier,
        )?.key ??
        systemPermissionFlagNameByUniversalIdentifier.get(
          grant.permissionFlagUniversalIdentifier,
        ) ??
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

const describeAgentList = (agentNames: string[]): string =>
  agentNames.map((name) => `"${name}"`).join(', ');

const groupAgentNamesByRoleUniversalIdentifier = ({
  agents,
  defaultRoleUniversalIdentifier,
}: {
  agents: AgentManifest[];
  defaultRoleUniversalIdentifier: string;
}): AgentNamesByRoleUniversalIdentifier => {
  const agentNamesByRoleUniversalIdentifier: AgentNamesByRoleUniversalIdentifier =
    new Map();

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

  return agentNamesByRoleUniversalIdentifier;
};

const validateApplicationDefaultRoleIsDefined = ({
  applicationRole,
  defaultRoleUniversalIdentifier,
}: {
  applicationRole: RoleManifest | undefined;
  defaultRoleUniversalIdentifier: string;
}): string[] =>
  isDefined(applicationRole)
    ? []
    : [
        `Application default role "${defaultRoleUniversalIdentifier}" is not defined by this application.`,
      ];

const validateAgentRolesAreDefined = ({
  agentNamesByRoleUniversalIdentifier,
  roles,
}: {
  agentNamesByRoleUniversalIdentifier: AgentNamesByRoleUniversalIdentifier;
  roles: RoleManifest[];
}): string[] =>
  [...agentNamesByRoleUniversalIdentifier]
    .filter(
      ([roleUniversalIdentifier]) =>
        !roles.some(
          (role) => role.universalIdentifier === roleUniversalIdentifier,
        ),
    )
    .map(
      ([roleUniversalIdentifier, agentNames]) =>
        `Agent ${describeAgentList(agentNames)} references role "${roleUniversalIdentifier}", which is not defined by this application.`,
    );

const validateAgentRolesAreCoveredByApplicationRole = ({
  agentNamesByRoleUniversalIdentifier,
  applicationRole,
  roles,
  objects,
  permissionFlags,
  systemPermissionFlagNameByUniversalIdentifier,
}: {
  agentNamesByRoleUniversalIdentifier: AgentNamesByRoleUniversalIdentifier;
  applicationRole: RoleManifest;
  roles: RoleManifest[];
  objects: ObjectDescriptor[];
  permissionFlags: PermissionFlagDescriptor[];
  systemPermissionFlagNameByUniversalIdentifier: Map<string, string>;
}): string[] => {
  const toolPermissionFlagUniversalIdentifiers = permissionFlags
    .filter((flag) => (flag.permissionType ?? 'tool') === 'tool')
    .map((flag) => flag.universalIdentifier);

  return [...agentNamesByRoleUniversalIdentifier].flatMap(
    ([roleUniversalIdentifier, agentNames]) => {
      const agentRole = roles.find(
        (role) => role.universalIdentifier === roleUniversalIdentifier,
      );

      if (!isDefined(agentRole)) {
        return [];
      }

      const uncoveredGrants = getRoleManifestGrantsNotCoveredBy({
        role: agentRole,
        superset: applicationRole,
        toolPermissionFlagUniversalIdentifiers,
      });

      if (uncoveredGrants.length === 0) {
        return [];
      }

      const grantList = uncoveredGrants
        .map((grant) =>
          describeGrant({
            grant,
            objects,
            permissionFlags,
            systemPermissionFlagNameByUniversalIdentifier,
          }),
        )
        .join(', ');

      return [
        `Role "${agentRole.label}" used by agent ${describeAgentList(agentNames)} grants more than the application role "${applicationRole.label}": ${grantList}. The application role must cover every permission an agent role grants.`,
      ];
    },
  );
};

export const validateAgentRolesWithinApplicationRole = ({
  agents,
  roles,
  objects,
  permissionFlags,
  defaultRoleUniversalIdentifier,
  systemPermissionFlag = SystemPermissionFlag,
}: {
  agents: AgentManifest[];
  roles: RoleManifest[];
  objects: ObjectDescriptor[];
  permissionFlags: PermissionFlagDescriptor[];
  defaultRoleUniversalIdentifier: string;
  systemPermissionFlag?: Record<string, string>;
}): string[] => {
  const applicationRole = roles.find(
    (role) => role.universalIdentifier === defaultRoleUniversalIdentifier,
  );
  const agentNamesByRoleUniversalIdentifier =
    groupAgentNamesByRoleUniversalIdentifier({
      agents,
      defaultRoleUniversalIdentifier,
    });

  return [
    ...validateApplicationDefaultRoleIsDefined({
      applicationRole,
      defaultRoleUniversalIdentifier,
    }),
    ...validateAgentRolesAreDefined({
      agentNamesByRoleUniversalIdentifier,
      roles,
    }),
    ...(isDefined(applicationRole)
      ? validateAgentRolesAreCoveredByApplicationRole({
          agentNamesByRoleUniversalIdentifier,
          applicationRole,
          roles,
          objects,
          permissionFlags,
          systemPermissionFlagNameByUniversalIdentifier:
            buildSystemPermissionFlagNameByUniversalIdentifier(
              systemPermissionFlag,
            ),
        })
      : []),
  ];
};
