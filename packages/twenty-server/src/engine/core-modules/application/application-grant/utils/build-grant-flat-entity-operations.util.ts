import { type RoleManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { fromObjectPermissionManifestToUniversalFlatObjectPermission } from 'src/engine/core-modules/application/application-manifest/converters/from-object-permission-manifest-to-universal-flat-object-permission.util';
import { fromPermissionFlagToUniversalFlatRolePermissionFlag } from 'src/engine/core-modules/application/application-manifest/converters/from-permission-flag-to-universal-flat-role-permission-flag.util';
import { fromRoleManifestToUniversalFlatRole } from 'src/engine/core-modules/application/application-manifest/converters/from-role-manifest-to-universal-flat-role.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type AllFlatEntityOperationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type UniversalFlatRoleTarget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role-target.type';

const ROLE_SWITCH_KEYS = [
  'canUpdateAllSettings',
  'canAccessAllTools',
  'canAccessAllAgentChatChannels',
  'canReadAllObjectRecords',
  'canUpdateAllObjectRecords',
  'canSoftDeleteAllObjectRecords',
  'canDestroyAllObjectRecords',
] as const;

const OBJECT_ACTION_KEYS = [
  'canReadObjectRecords',
  'canUpdateObjectRecords',
  'canSoftDeleteObjectRecords',
  'canDestroyObjectRecords',
] as const;

type GrantOperations = Required<
  Pick<
    AllFlatEntityOperationByMetadataName,
    'role' | 'objectPermission' | 'rolePermissionFlag' | 'roleTarget'
  >
>;

const buildGrantRoleOperation = ({
  existingFlatRole,
  desiredRoleManifest,
  grantRoleUniversalIdentifier,
  grantRoleLabel,
  workspaceCustomApplicationUniversalIdentifier,
  now,
}: {
  existingFlatRole: FlatRole | undefined;
  desiredRoleManifest: RoleManifest;
  grantRoleUniversalIdentifier: string;
  grantRoleLabel: string;
  workspaceCustomApplicationUniversalIdentifier: string;
  now: string;
}): GrantOperations['role'] => {
  if (!isDefined(existingFlatRole)) {
    return {
      flatEntityToCreate: [
        {
          ...fromRoleManifestToUniversalFlatRole({
            roleManifest: {
              ...desiredRoleManifest,
              universalIdentifier: grantRoleUniversalIdentifier,
              label: grantRoleLabel,
              icon: 'IconApps',
              description: undefined,
            },
            applicationUniversalIdentifier:
              workspaceCustomApplicationUniversalIdentifier,
            now,
          }),
          id: v4(),
          isEditable: false,
          canBeAssignedToUsers: false,
          canBeAssignedToApiKeys: false,
          canBeAssignedToAgents: true,
          canBeAssignedToApplications: true,
        },
      ],
      flatEntityToUpdate: [],
      flatEntityToDelete: [],
    };
  }

  const hasSwitchChanged = ROLE_SWITCH_KEYS.some(
    (key) => (desiredRoleManifest[key] ?? false) !== existingFlatRole[key],
  );

  return {
    flatEntityToCreate: [],
    flatEntityToUpdate: hasSwitchChanged
      ? [
          {
            ...existingFlatRole,
            ...Object.fromEntries(
              ROLE_SWITCH_KEYS.map((key) => [
                key,
                desiredRoleManifest[key] ?? false,
              ]),
            ),
            updatedAt: now,
          },
        ]
      : [],
    flatEntityToDelete: [],
  };
};

const buildObjectPermissionOperations = ({
  existingFlatRole,
  desiredRoleManifest,
  grantRoleUniversalIdentifier,
  workspaceCustomApplicationUniversalIdentifier,
  flatObjectPermissionMaps,
  now,
}: {
  existingFlatRole: FlatRole | undefined;
  desiredRoleManifest: RoleManifest;
  grantRoleUniversalIdentifier: string;
  workspaceCustomApplicationUniversalIdentifier: string;
  now: string;
} & Pick<
  AllFlatEntityMaps,
  'flatObjectPermissionMaps'
>): GrantOperations['objectPermission'] => {
  const existingByObjectUniversalIdentifier = new Map(
    (existingFlatRole?.objectPermissionUniversalIdentifiers ?? [])
      .map(
        (universalIdentifier) =>
          flatObjectPermissionMaps.byUniversalIdentifier[universalIdentifier],
      )
      .filter(isDefined)
      .map((flatObjectPermission) => [
        flatObjectPermission.objectMetadataUniversalIdentifier,
        flatObjectPermission,
      ]),
  );

  const operations: GrantOperations['objectPermission'] = {
    flatEntityToCreate: [],
    flatEntityToUpdate: [],
    flatEntityToDelete: [],
  };

  const desiredObjectUniversalIdentifiers = new Set<string>();

  for (const objectPermissionManifest of desiredRoleManifest.objectPermissions ??
    []) {
    desiredObjectUniversalIdentifiers.add(
      objectPermissionManifest.objectUniversalIdentifier,
    );

    const desired = fromObjectPermissionManifestToUniversalFlatObjectPermission(
      {
        objectPermissionManifest: {
          ...objectPermissionManifest,
          universalIdentifier: undefined,
        },
        roleUniversalIdentifier: grantRoleUniversalIdentifier,
        applicationUniversalIdentifier:
          workspaceCustomApplicationUniversalIdentifier,
        now,
      },
    );

    const existing = existingByObjectUniversalIdentifier.get(
      objectPermissionManifest.objectUniversalIdentifier,
    );

    if (!isDefined(existing)) {
      operations.flatEntityToCreate.push({ ...desired, id: v4() });
      continue;
    }

    const hasChanged = OBJECT_ACTION_KEYS.some(
      (key) => (existing[key] ?? null) !== (desired[key] ?? null),
    );

    if (hasChanged) {
      operations.flatEntityToUpdate.push({
        ...existing,
        ...Object.fromEntries(
          OBJECT_ACTION_KEYS.map((key) => [key, desired[key] ?? null]),
        ),
        updatedAt: now,
      });
    }
  }

  for (const [
    objectUniversalIdentifier,
    existing,
  ] of existingByObjectUniversalIdentifier) {
    if (!desiredObjectUniversalIdentifiers.has(objectUniversalIdentifier)) {
      operations.flatEntityToDelete.push(existing);
    }
  }

  return operations;
};

const buildRolePermissionFlagOperations = ({
  existingFlatRole,
  desiredRoleManifest,
  grantRoleUniversalIdentifier,
  workspaceCustomApplicationUniversalIdentifier,
  flatRolePermissionFlagMaps,
  now,
}: {
  existingFlatRole: FlatRole | undefined;
  desiredRoleManifest: RoleManifest;
  grantRoleUniversalIdentifier: string;
  workspaceCustomApplicationUniversalIdentifier: string;
  now: string;
} & Pick<
  AllFlatEntityMaps,
  'flatRolePermissionFlagMaps'
>): GrantOperations['rolePermissionFlag'] => {
  const existingFlatRolePermissionFlags = (
    existingFlatRole?.rolePermissionFlagUniversalIdentifiers ?? []
  )
    .map(
      (universalIdentifier) =>
        flatRolePermissionFlagMaps.byUniversalIdentifier[universalIdentifier],
    )
    .filter(isDefined);

  const existingPermissionFlagUniversalIdentifiers = new Set(
    existingFlatRolePermissionFlags.map(
      (flatRolePermissionFlag) =>
        flatRolePermissionFlag.permissionFlagUniversalIdentifier,
    ),
  );
  const desiredPermissionFlagUniversalIdentifiers = new Set(
    desiredRoleManifest.permissionFlagUniversalIdentifiers ?? [],
  );

  return {
    flatEntityToCreate: [...desiredPermissionFlagUniversalIdentifiers]
      .filter(
        (permissionFlagUniversalIdentifier) =>
          !existingPermissionFlagUniversalIdentifiers.has(
            permissionFlagUniversalIdentifier,
          ),
      )
      .map((permissionFlagUniversalIdentifier) => ({
        ...fromPermissionFlagToUniversalFlatRolePermissionFlag({
          permissionFlagUniversalIdentifier,
          roleUniversalIdentifier: grantRoleUniversalIdentifier,
          applicationUniversalIdentifier:
            workspaceCustomApplicationUniversalIdentifier,
          now,
        }),
        id: v4(),
      })),
    flatEntityToUpdate: [],
    flatEntityToDelete: existingFlatRolePermissionFlags.filter(
      (flatRolePermissionFlag) =>
        !desiredPermissionFlagUniversalIdentifiers.has(
          flatRolePermissionFlag.permissionFlagUniversalIdentifier,
        ),
    ),
  };
};

const buildRoleTargetOperations = ({
  applicationId,
  grantRoleUniversalIdentifier,
  agentUniversalIdentifiers,
  workspaceCustomApplicationUniversalIdentifier,
  flatRoleTargetMaps,
  now,
}: {
  applicationId: string;
  grantRoleUniversalIdentifier: string;
  agentUniversalIdentifiers: string[];
  workspaceCustomApplicationUniversalIdentifier: string;
  now: string;
} & Pick<
  AllFlatEntityMaps,
  'flatRoleTargetMaps'
>): GrantOperations['roleTarget'] => {
  const flatRoleTargets = Object.values(
    flatRoleTargetMaps.byUniversalIdentifier,
  ).filter(isDefined);

  const operations: GrantOperations['roleTarget'] = {
    flatEntityToCreate: [],
    flatEntityToUpdate: [],
    flatEntityToDelete: [],
  };

  const buildRoleTarget = (
    target: Pick<
      UniversalFlatRoleTarget,
      'agentUniversalIdentifier' | 'targetApplicationId'
    >,
  ) => ({
    id: v4(),
    universalIdentifier: v4(),
    applicationUniversalIdentifier:
      workspaceCustomApplicationUniversalIdentifier,
    roleUniversalIdentifier: grantRoleUniversalIdentifier,
    userWorkspaceId: null,
    apiKeyId: null,
    webhookUniversalIdentifier: null,
    createdAt: now,
    updatedAt: now,
    ...target,
  });

  const hasApplicationTarget = flatRoleTargets.some(
    (flatRoleTarget) => flatRoleTarget.targetApplicationId === applicationId,
  );

  if (!hasApplicationTarget) {
    operations.flatEntityToCreate.push(
      buildRoleTarget({
        agentUniversalIdentifier: null,
        targetApplicationId: applicationId,
      }),
    );
  }

  const desiredAgentUniversalIdentifiers = new Set(agentUniversalIdentifiers);

  for (const agentUniversalIdentifier of desiredAgentUniversalIdentifiers) {
    const existing = flatRoleTargets.find(
      (flatRoleTarget) =>
        flatRoleTarget.agentUniversalIdentifier === agentUniversalIdentifier,
    );

    if (!isDefined(existing)) {
      operations.flatEntityToCreate.push(
        buildRoleTarget({
          agentUniversalIdentifier,
          targetApplicationId: null,
        }),
      );
      continue;
    }

    const isOwnedByWorkspaceCustomApplication =
      existing.applicationUniversalIdentifier ===
      workspaceCustomApplicationUniversalIdentifier;

    if (
      isOwnedByWorkspaceCustomApplication &&
      existing.roleUniversalIdentifier !== grantRoleUniversalIdentifier
    ) {
      operations.flatEntityToUpdate.push({
        ...existing,
        roleUniversalIdentifier: grantRoleUniversalIdentifier,
        updatedAt: now,
      });
    }
  }

  for (const flatRoleTarget of flatRoleTargets) {
    if (
      flatRoleTarget.roleUniversalIdentifier === grantRoleUniversalIdentifier &&
      isDefined(flatRoleTarget.agentUniversalIdentifier) &&
      !desiredAgentUniversalIdentifiers.has(
        flatRoleTarget.agentUniversalIdentifier,
      )
    ) {
      operations.flatEntityToDelete.push(flatRoleTarget);
    }
  }

  return operations;
};

export const buildGrantFlatEntityOperations = ({
  applicationId,
  existingFlatRole,
  desiredRoleManifest,
  grantRoleUniversalIdentifier,
  grantRoleLabel,
  agentUniversalIdentifiers,
  workspaceCustomApplicationUniversalIdentifier,
  flatObjectPermissionMaps,
  flatRolePermissionFlagMaps,
  flatRoleTargetMaps,
}: {
  applicationId: string;
  existingFlatRole: FlatRole | undefined;
  desiredRoleManifest: RoleManifest;
  grantRoleUniversalIdentifier: string;
  grantRoleLabel: string;
  agentUniversalIdentifiers: string[];
  workspaceCustomApplicationUniversalIdentifier: string;
} & Pick<
  AllFlatEntityMaps,
  | 'flatObjectPermissionMaps'
  | 'flatRolePermissionFlagMaps'
  | 'flatRoleTargetMaps'
>): GrantOperations => {
  const now = new Date().toISOString();
  const common = {
    existingFlatRole,
    desiredRoleManifest,
    grantRoleUniversalIdentifier,
    workspaceCustomApplicationUniversalIdentifier,
    now,
  };

  return {
    role: buildGrantRoleOperation({ ...common, grantRoleLabel }),
    objectPermission: buildObjectPermissionOperations({
      ...common,
      flatObjectPermissionMaps,
    }),
    rolePermissionFlag: buildRolePermissionFlagOperations({
      ...common,
      flatRolePermissionFlagMaps,
    }),
    roleTarget: buildRoleTargetOperations({
      applicationId,
      grantRoleUniversalIdentifier,
      agentUniversalIdentifiers,
      workspaceCustomApplicationUniversalIdentifier,
      flatRoleTargetMaps,
      now,
    }),
  };
};
