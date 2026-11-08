import { getApplicationGrantRoleUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { v4, v5 } from 'uuid';

import { computeApplicationGrantRoleLabel } from 'src/engine/core-modules/application/application-grant/utils/compute-application-grant-role-label.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { type MetadataToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key.type';
import { getSubUniversalFlatEntityByUniversalIdentifiersMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/get-sub-universal-flat-entity-by-universal-identifiers-maps-or-throw.util';
import { getMetadataRelatedMetadataNamesForValidation } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names-for-validation.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
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

type ApplicationGrantUniversalFlatEntityMaps = Pick<
  AllUniversalFlatEntityMaps,
  MetadataToFlatEntityMapsKey<ApplicationGrantMetadataName>
>;

type RolePermissionUniversalFlatEntityMaps = Omit<
  ApplicationGrantUniversalFlatEntityMaps,
  'flatRoleMaps' | 'flatRoleTargetMaps'
>;

type BuildApplicationGrantFromToFlatEntityMapsArgs = {
  targetFlatApplication: Pick<FlatApplication, 'name' | 'universalIdentifier'>;
  requestedFlatRole: FlatRole;
  existingGrant:
    | { flatRole: FlatRole; flatRoleTarget: FlatRoleTarget }
    | undefined;
  workspaceCustomApplicationUniversalIdentifier: string;
  flatEntityMaps: ApplicationGrantFlatEntityMaps;
  now: string;
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

type RolePermissionMetadataName = Exclude<
  ApplicationGrantMetadataName,
  'role' | 'roleTarget'
>;

type RolePermissionMappers = {
  [P in RolePermissionMetadataName]: (
    source: MetadataFlatEntity<P>,
  ) => MetadataUniversalFlatEntity<P> | undefined;
};

const mapUniversalFlatEntityMaps = <
  TSource,
  TTarget extends { universalIdentifier: string },
>(
  universalFlatEntityMaps: {
    byUniversalIdentifier: Partial<Record<string, TSource>>;
  },
  mapper: (source: TSource) => TTarget | undefined,
) =>
  toUniversalFlatEntityMaps(
    Object.values(universalFlatEntityMaps.byUniversalIdentifier)
      .filter(isDefined)
      .map(mapper)
      .filter(isDefined),
  );

const findRolePermissionUniversalFlatEntityMaps = ({
  flatRole,
  flatEntityMaps,
  mappers,
}: {
  flatRole: FlatRole;
  flatEntityMaps: ApplicationGrantFlatEntityMaps;
  mappers?: RolePermissionMappers;
}): RolePermissionUniversalFlatEntityMaps => ({
  flatObjectPermissionMaps: mapUniversalFlatEntityMaps(
    getSubUniversalFlatEntityByUniversalIdentifiersMapsOrThrow({
      universalFlatEntityMaps: flatEntityMaps.flatObjectPermissionMaps,
      universalIdentifiers: flatRole.objectPermissionUniversalIdentifiers,
    }),
    mappers?.objectPermission ?? ((source) => source),
  ),
  flatFieldPermissionMaps: mapUniversalFlatEntityMaps(
    getSubUniversalFlatEntityByUniversalIdentifiersMapsOrThrow({
      universalFlatEntityMaps: flatEntityMaps.flatFieldPermissionMaps,
      universalIdentifiers: flatRole.fieldPermissionUniversalIdentifiers,
    }),
    mappers?.fieldPermission ?? ((source) => source),
  ),
  flatRolePermissionFlagMaps: mapUniversalFlatEntityMaps(
    getSubUniversalFlatEntityByUniversalIdentifiersMapsOrThrow({
      universalFlatEntityMaps: flatEntityMaps.flatRolePermissionFlagMaps,
      universalIdentifiers: flatRole.rolePermissionFlagUniversalIdentifiers,
    }),
    mappers?.rolePermissionFlag ?? ((source) => source),
  ),
  flatRowLevelPermissionPredicateGroupMaps: mapUniversalFlatEntityMaps(
    getSubUniversalFlatEntityByUniversalIdentifiersMapsOrThrow({
      universalFlatEntityMaps:
        flatEntityMaps.flatRowLevelPermissionPredicateGroupMaps,
      universalIdentifiers:
        flatRole.rowLevelPermissionPredicateGroupUniversalIdentifiers,
    }),
    mappers?.rowLevelPermissionPredicateGroup ?? ((source) => source),
  ),
  flatRowLevelPermissionPredicateMaps: mapUniversalFlatEntityMaps(
    getSubUniversalFlatEntityByUniversalIdentifiersMapsOrThrow({
      universalFlatEntityMaps:
        flatEntityMaps.flatRowLevelPermissionPredicateMaps,
      universalIdentifiers:
        flatRole.rowLevelPermissionPredicateUniversalIdentifiers,
    }),
    mappers?.rowLevelPermissionPredicate ?? ((source) => source),
  ),
});

const findExistingGrantUniversalFlatEntityMaps = ({
  existingGrant,
  flatEntityMaps,
}: BuildApplicationGrantFromToFlatEntityMapsArgs): ApplicationGrantUniversalFlatEntityMaps =>
  isDefined(existingGrant)
    ? {
        flatRoleMaps: toUniversalFlatEntityMaps([existingGrant.flatRole]),
        flatRoleTargetMaps: toUniversalFlatEntityMaps([
          existingGrant.flatRoleTarget,
        ]),
        ...findRolePermissionUniversalFlatEntityMaps({
          flatRole: existingGrant.flatRole,
          flatEntityMaps,
        }),
      }
    : {
        flatRoleMaps: toUniversalFlatEntityMaps([]),
        flatRoleTargetMaps: toUniversalFlatEntityMaps([]),
        flatObjectPermissionMaps: toUniversalFlatEntityMaps([]),
        flatFieldPermissionMaps: toUniversalFlatEntityMaps([]),
        flatRolePermissionFlagMaps: toUniversalFlatEntityMaps([]),
        flatRowLevelPermissionPredicateGroupMaps: toUniversalFlatEntityMaps([]),
        flatRowLevelPermissionPredicateMaps: toUniversalFlatEntityMaps([]),
      };

const buildDesiredGrantUniversalFlatEntityMaps = ({
  targetFlatApplication,
  requestedFlatRole,
  existingGrant,
  workspaceCustomApplicationUniversalIdentifier,
  flatEntityMaps,
  now,
}: BuildApplicationGrantFromToFlatEntityMapsArgs): ApplicationGrantUniversalFlatEntityMaps => {
  const grantRoleIdentity = isDefined(existingGrant)
    ? {
        universalIdentifier: existingGrant.flatRole.universalIdentifier,
        label: existingGrant.flatRole.label,
        createdAt: existingGrant.flatRole.createdAt,
      }
    : {
        universalIdentifier: getApplicationGrantRoleUniversalIdentifier({
          grantedApplicationUniversalIdentifier:
            targetFlatApplication.universalIdentifier,
        }),
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

  return {
    flatRoleMaps: toUniversalFlatEntityMaps([
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
        canCreateAllObjectRecords: requestedFlatRole.canCreateAllObjectRecords,
        canUpdateAllObjectRecords: requestedFlatRole.canUpdateAllObjectRecords,
        canSoftDeleteAllObjectRecords:
          requestedFlatRole.canSoftDeleteAllObjectRecords,
        canDestroyAllObjectRecords:
          requestedFlatRole.canDestroyAllObjectRecords,
        isEditable: false,
        canBeAssignedToUsers: false,
        canBeAssignedToAgents: false,
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
    ]),
    flatRoleTargetMaps: toUniversalFlatEntityMaps([
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
    ]),
    ...findRolePermissionUniversalFlatEntityMaps({
      flatRole: requestedFlatRole,
      flatEntityMaps,
      mappers: {
        objectPermission: (source) => ({
          ...owner,
          universalIdentifier: toCopyUniversalIdentifier(
            source.universalIdentifier,
          ),
          objectMetadataUniversalIdentifier:
            source.objectMetadataUniversalIdentifier,
          canReadObjectRecords: source.canReadObjectRecords ?? null,
          canCreateObjectRecords: source.canCreateObjectRecords ?? null,
          canUpdateObjectRecords: source.canUpdateObjectRecords ?? null,
          canSoftDeleteObjectRecords: source.canSoftDeleteObjectRecords ?? null,
          canDestroyObjectRecords: source.canDestroyObjectRecords ?? null,
        }),
        fieldPermission: (source) => ({
          ...owner,
          universalIdentifier: toCopyUniversalIdentifier(
            source.universalIdentifier,
          ),
          objectMetadataUniversalIdentifier:
            source.objectMetadataUniversalIdentifier,
          fieldMetadataUniversalIdentifier:
            source.fieldMetadataUniversalIdentifier,
          canReadFieldValue: source.canReadFieldValue ?? null,
          canUpdateFieldValue: source.canUpdateFieldValue ?? null,
        }),
        rolePermissionFlag: (source) => ({
          ...owner,
          universalIdentifier: toCopyUniversalIdentifier(
            source.universalIdentifier,
          ),
          permissionFlagUniversalIdentifier:
            source.permissionFlagUniversalIdentifier,
        }),
        rowLevelPermissionPredicateGroup: (source) =>
          isDefined(source.deletedAt)
            ? undefined
            : {
                ...owner,
                universalIdentifier: toCopyUniversalIdentifier(
                  source.universalIdentifier,
                ),
                objectMetadataUniversalIdentifier:
                  source.objectMetadataUniversalIdentifier,
                logicalOperator: source.logicalOperator,
                canReadRecords: source.canReadRecords,
                canCreateRecords: source.canCreateRecords,
                canUpdateRecords: source.canUpdateRecords,
                canSoftDeleteRecords: source.canSoftDeleteRecords,
                canDestroyRecords: source.canDestroyRecords,
                parentRowLevelPermissionPredicateGroupUniversalIdentifier:
                  toNullableCopyUniversalIdentifier(
                    source.parentRowLevelPermissionPredicateGroupUniversalIdentifier,
                  ),
                positionInRowLevelPermissionPredicateGroup:
                  source.positionInRowLevelPermissionPredicateGroup,
                childRowLevelPermissionPredicateGroupUniversalIdentifiers: [],
                rowLevelPermissionPredicateUniversalIdentifiers: [],
                deletedAt: null,
              },
        rowLevelPermissionPredicate: (source) =>
          isDefined(source.deletedAt)
            ? undefined
            : {
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
              },
      },
    }),
  };
};

// From is the current grant, to is the grant matching the requested role: the builder diffs them
export const buildApplicationGrantFromToFlatEntityMaps = (
  args: BuildApplicationGrantFromToFlatEntityMapsArgs,
): FromToAllUniversalFlatEntityMaps => {
  const from = findExistingGrantUniversalFlatEntityMaps(args);
  const to = buildDesiredGrantUniversalFlatEntityMaps(args);

  return {
    flatRoleMaps: { from: from.flatRoleMaps, to: to.flatRoleMaps },
    flatRoleTargetMaps: {
      from: from.flatRoleTargetMaps,
      to: to.flatRoleTargetMaps,
    },
    flatObjectPermissionMaps: {
      from: from.flatObjectPermissionMaps,
      to: to.flatObjectPermissionMaps,
    },
    flatFieldPermissionMaps: {
      from: from.flatFieldPermissionMaps,
      to: to.flatFieldPermissionMaps,
    },
    flatRolePermissionFlagMaps: {
      from: from.flatRolePermissionFlagMaps,
      to: to.flatRolePermissionFlagMaps,
    },
    flatRowLevelPermissionPredicateGroupMaps: {
      from: from.flatRowLevelPermissionPredicateGroupMaps,
      to: to.flatRowLevelPermissionPredicateGroupMaps,
    },
    flatRowLevelPermissionPredicateMaps: {
      from: from.flatRowLevelPermissionPredicateMaps,
      to: to.flatRowLevelPermissionPredicateMaps,
    },
  };
};
