import { isDefined } from 'twenty-shared/utils';
import { v4, v5 } from 'uuid';

import { computeApplicationGrantRoleLabel } from 'src/engine/core-modules/application/application-grant/utils/compute-application-grant-role-label.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type MetadataToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key.type';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-universal-identifier-in-universal-flat-entity-maps.util';
import { getMetadataRelatedMetadataNamesForValidation } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names-for-validation.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type FromToAllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';

export const APPLICATION_GRANT_METADATA_NAMES = [
  'role',
  'roleTarget',
  'objectPermission',
  'fieldPermission',
  'rolePermissionFlag',
  'rowLevelPermissionPredicateGroup',
  'rowLevelPermissionPredicate',
] as const;

type ApplicationGrantMetadataName =
  (typeof APPLICATION_GRANT_METADATA_NAMES)[number];

// The grant's own maps plus what their validators look up, such as all roles for label uniqueness
export const APPLICATION_GRANT_DEPENDENCY_FLAT_ENTITY_MAPS_KEYS = [
  ...new Set(
    APPLICATION_GRANT_METADATA_NAMES.flatMap((metadataName) => [
      metadataName,
      ...getMetadataRelatedMetadataNamesForValidation(metadataName),
    ]),
  ),
].map(getMetadataFlatEntityMapsKey);

export type ApplicationGrantFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  MetadataToFlatEntityMapsKey<
    Exclude<ApplicationGrantMetadataName, 'roleTarget'>
  >
>;

type ApplicationGrantUniversalFlatEntities = {
  [P in ApplicationGrantMetadataName]: MetadataUniversalFlatEntity<P>[];
};

type ExistingApplicationGrant = {
  flatRole: FlatRole;
  flatRoleTarget: FlatRoleTarget;
};

const findRolePermissionFlatEntities = ({
  flatRole,
  flatEntityMaps,
}: {
  flatRole: FlatRole;
  flatEntityMaps: ApplicationGrantFlatEntityMaps;
}): Omit<ApplicationGrantUniversalFlatEntities, 'role' | 'roleTarget'> => ({
  objectPermission:
    findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps({
      flatEntityMaps: flatEntityMaps.flatObjectPermissionMaps,
      universalIdentifiers: flatRole.objectPermissionUniversalIdentifiers,
    }),
  fieldPermission:
    findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps({
      flatEntityMaps: flatEntityMaps.flatFieldPermissionMaps,
      universalIdentifiers: flatRole.fieldPermissionUniversalIdentifiers,
    }),
  rolePermissionFlag:
    findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps({
      flatEntityMaps: flatEntityMaps.flatRolePermissionFlagMaps,
      universalIdentifiers: flatRole.rolePermissionFlagUniversalIdentifiers,
    }),
  rowLevelPermissionPredicateGroup:
    findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps({
      flatEntityMaps: flatEntityMaps.flatRowLevelPermissionPredicateGroupMaps,
      universalIdentifiers:
        flatRole.rowLevelPermissionPredicateGroupUniversalIdentifiers,
    }),
  rowLevelPermissionPredicate:
    findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps({
      flatEntityMaps: flatEntityMaps.flatRowLevelPermissionPredicateMaps,
      universalIdentifiers:
        flatRole.rowLevelPermissionPredicateUniversalIdentifiers,
    }),
});

const findExistingGrantFlatEntities = ({
  existingGrant,
  flatEntityMaps,
}: {
  existingGrant: ExistingApplicationGrant | undefined;
  flatEntityMaps: ApplicationGrantFlatEntityMaps;
}): ApplicationGrantUniversalFlatEntities =>
  isDefined(existingGrant)
    ? {
        role: [existingGrant.flatRole],
        roleTarget: [existingGrant.flatRoleTarget],
        ...findRolePermissionFlatEntities({
          flatRole: existingGrant.flatRole,
          flatEntityMaps,
        }),
      }
    : {
        role: [],
        roleTarget: [],
        objectPermission: [],
        fieldPermission: [],
        rolePermissionFlag: [],
        rowLevelPermissionPredicateGroup: [],
        rowLevelPermissionPredicate: [],
      };

const buildDesiredGrantUniversalFlatEntities = ({
  targetFlatApplication,
  requestedFlatRole,
  existingGrant,
  workspaceCustomApplicationUniversalIdentifier,
  flatEntityMaps,
  now,
}: {
  targetFlatApplication: Pick<FlatApplication, 'name' | 'universalIdentifier'>;
  requestedFlatRole: FlatRole;
  existingGrant: ExistingApplicationGrant | undefined;
  workspaceCustomApplicationUniversalIdentifier: string;
  flatEntityMaps: ApplicationGrantFlatEntityMaps;
  now: string;
}): ApplicationGrantUniversalFlatEntities => {
  const grantRoleIdentity = isDefined(existingGrant)
    ? {
        universalIdentifier: existingGrant.flatRole.universalIdentifier,
        label: existingGrant.flatRole.label,
        createdAt: existingGrant.flatRole.createdAt,
      }
    : {
        universalIdentifier: v4(),
        label: computeApplicationGrantRoleLabel({
          applicationName: targetFlatApplication.name,
          flatRoleMaps: flatEntityMaps.flatRoleMaps,
        }),
        createdAt: now,
      };

  const grantRoleTargetIdentity = isDefined(existingGrant)
    ? {
        universalIdentifier: existingGrant.flatRoleTarget.universalIdentifier,
        createdAt: existingGrant.flatRoleTarget.createdAt,
      }
    : { universalIdentifier: v4(), createdAt: now };

  const grantRoleUniversalIdentifier = grantRoleIdentity.universalIdentifier;

  // Copies are keyed on their source, so a sync updates the previous copy in place
  const toCopyUniversalIdentifier = (sourceUniversalIdentifier: string) =>
    v5(sourceUniversalIdentifier, grantRoleUniversalIdentifier);

  const toNullableCopyUniversalIdentifier = (
    sourceUniversalIdentifier: string | null,
  ) =>
    isDefined(sourceUniversalIdentifier)
      ? toCopyUniversalIdentifier(sourceUniversalIdentifier)
      : null;

  const owner = {
    applicationUniversalIdentifier:
      workspaceCustomApplicationUniversalIdentifier,
    roleUniversalIdentifier: grantRoleUniversalIdentifier,
    createdAt: now,
    updatedAt: now,
  };

  const requested = findRolePermissionFlatEntities({
    flatRole: requestedFlatRole,
    flatEntityMaps,
  });

  return {
    role: [
      {
        ...grantRoleIdentity,
        applicationUniversalIdentifier:
          workspaceCustomApplicationUniversalIdentifier,
        description: requestedFlatRole.description,
        icon: requestedFlatRole.icon,
        canUpdateAllSettings: requestedFlatRole.canUpdateAllSettings,
        canAccessAllTools: requestedFlatRole.canAccessAllTools,
        canAccessAllAgentChatChannels:
          requestedFlatRole.canAccessAllAgentChatChannels,
        canReadAllObjectRecords: requestedFlatRole.canReadAllObjectRecords,
        canUpdateAllObjectRecords: requestedFlatRole.canUpdateAllObjectRecords,
        canSoftDeleteAllObjectRecords:
          requestedFlatRole.canSoftDeleteAllObjectRecords,
        canDestroyAllObjectRecords:
          requestedFlatRole.canDestroyAllObjectRecords,
        isEditable: false,
        canBeAssignedToUsers: false,
        canBeAssignedToAgents: true,
        canBeAssignedToApiKeys: false,
        canBeAssignedToApplications: true,
        roleTargetUniversalIdentifiers: [],
        objectPermissionUniversalIdentifiers: [],
        fieldPermissionUniversalIdentifiers: [],
        rolePermissionFlagUniversalIdentifiers: [],
        rowLevelPermissionPredicateUniversalIdentifiers: [],
        rowLevelPermissionPredicateGroupUniversalIdentifiers: [],
        agentChatChannelRoleUniversalIdentifiers: [],
        updatedAt: now,
      },
    ],
    roleTarget: [
      {
        ...owner,
        ...grantRoleTargetIdentity,
        userWorkspaceId: null,
        agentUniversalIdentifier: null,
        apiKeyId: null,
        webhookUniversalIdentifier: null,
        targetApplicationUniversalIdentifier:
          targetFlatApplication.universalIdentifier,
      },
    ],
    objectPermission: requested.objectPermission.map((source) => ({
      ...owner,
      universalIdentifier: toCopyUniversalIdentifier(
        source.universalIdentifier,
      ),
      objectMetadataUniversalIdentifier:
        source.objectMetadataUniversalIdentifier,
      canReadObjectRecords: source.canReadObjectRecords ?? null,
      canUpdateObjectRecords: source.canUpdateObjectRecords ?? null,
      canSoftDeleteObjectRecords: source.canSoftDeleteObjectRecords ?? null,
      canDestroyObjectRecords: source.canDestroyObjectRecords ?? null,
    })),
    fieldPermission: requested.fieldPermission.map((source) => ({
      ...owner,
      universalIdentifier: toCopyUniversalIdentifier(
        source.universalIdentifier,
      ),
      objectMetadataUniversalIdentifier:
        source.objectMetadataUniversalIdentifier,
      fieldMetadataUniversalIdentifier: source.fieldMetadataUniversalIdentifier,
      canReadFieldValue: source.canReadFieldValue ?? null,
      canUpdateFieldValue: source.canUpdateFieldValue ?? null,
    })),
    rolePermissionFlag: requested.rolePermissionFlag.map((source) => ({
      ...owner,
      universalIdentifier: toCopyUniversalIdentifier(
        source.universalIdentifier,
      ),
      permissionFlagUniversalIdentifier:
        source.permissionFlagUniversalIdentifier,
    })),
    rowLevelPermissionPredicateGroup: requested.rowLevelPermissionPredicateGroup
      .filter((source) => !isDefined(source.deletedAt))
      .map((source) => ({
        ...owner,
        universalIdentifier: toCopyUniversalIdentifier(
          source.universalIdentifier,
        ),
        objectMetadataUniversalIdentifier:
          source.objectMetadataUniversalIdentifier,
        logicalOperator: source.logicalOperator,
        parentRowLevelPermissionPredicateGroupUniversalIdentifier:
          toNullableCopyUniversalIdentifier(
            source.parentRowLevelPermissionPredicateGroupUniversalIdentifier,
          ),
        positionInRowLevelPermissionPredicateGroup:
          source.positionInRowLevelPermissionPredicateGroup,
        childRowLevelPermissionPredicateGroupUniversalIdentifiers: [],
        rowLevelPermissionPredicateUniversalIdentifiers: [],
        deletedAt: null,
      })),
    rowLevelPermissionPredicate: requested.rowLevelPermissionPredicate
      .filter((source) => !isDefined(source.deletedAt))
      .map((source) => ({
        ...owner,
        universalIdentifier: toCopyUniversalIdentifier(
          source.universalIdentifier,
        ),
        objectMetadataUniversalIdentifier:
          source.objectMetadataUniversalIdentifier,
        fieldMetadataUniversalIdentifier:
          source.fieldMetadataUniversalIdentifier,
        relationFieldMetadataUniversalIdentifier:
          source.relationFieldMetadataUniversalIdentifier,
        operand: source.operand,
        value: source.value,
        subFieldName: source.subFieldName,
        workspaceMemberFieldMetadataUniversalIdentifier:
          source.workspaceMemberFieldMetadataUniversalIdentifier,
        workspaceMemberSubFieldName: source.workspaceMemberSubFieldName,
        rowLevelPermissionPredicateGroupUniversalIdentifier:
          toNullableCopyUniversalIdentifier(
            source.rowLevelPermissionPredicateGroupUniversalIdentifier,
          ),
        positionInRowLevelPermissionPredicateGroup:
          source.positionInRowLevelPermissionPredicateGroup,
        deletedAt: null,
      })),
  };
};

const toUniversalFlatEntityMaps = <
  TUniversalFlatEntity extends { universalIdentifier: string },
>(
  universalFlatEntities: TUniversalFlatEntity[],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    universalFlatEntities.map((universalFlatEntity) => [
      universalFlatEntity.universalIdentifier,
      universalFlatEntity,
    ]),
  ),
});

// From is the current grant, to is the grant matching the requested role: the builder diffs them
export const buildApplicationGrantFromToFlatEntityMaps = ({
  existingGrant,
  flatEntityMaps,
  ...args
}: Parameters<
  typeof buildDesiredGrantUniversalFlatEntities
>[0]): FromToAllUniversalFlatEntityMaps => {
  const from = findExistingGrantFlatEntities({ existingGrant, flatEntityMaps });
  const to = buildDesiredGrantUniversalFlatEntities({
    existingGrant,
    flatEntityMaps,
    ...args,
  });

  return Object.fromEntries(
    APPLICATION_GRANT_METADATA_NAMES.map((metadataName) => [
      getMetadataFlatEntityMapsKey(metadataName),
      {
        from: toUniversalFlatEntityMaps<{ universalIdentifier: string }>(
          from[metadataName],
        ),
        to: toUniversalFlatEntityMaps<{ universalIdentifier: string }>(
          to[metadataName],
        ),
      },
    ]),
  ) as FromToAllUniversalFlatEntityMaps;
};
