import { getApplicationGrantRoleUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { v4, v5 } from 'uuid';

import { computeApplicationGrantRoleLabel } from 'src/engine/core-modules/application/application-grant-role/utils/compute-application-grant-role-label.util';
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

export const APPLICATION_GRANT_ROLE_METADATA_NAMES = [
  'role',
  'roleTarget',
  'objectPermission',
  'fieldPermission',
  'rolePermissionFlag',
  'rowLevelPermissionPredicateGroup',
  'rowLevelPermissionPredicate',
] as const;

type ApplicationGrantRoleMetadataName =
  (typeof APPLICATION_GRANT_ROLE_METADATA_NAMES)[number];

// The grant's own maps plus what their validators look up, such as all roles for label uniqueness
export const APPLICATION_GRANT_ROLE_DEPENDENCY_FLAT_ENTITY_MAPS_KEYS = [
  ...new Set(
    APPLICATION_GRANT_ROLE_METADATA_NAMES.flatMap((metadataName) => [
      metadataName,
      ...getMetadataRelatedMetadataNamesForValidation(metadataName),
    ]),
  ),
].map(getMetadataFlatEntityMapsKey);

export type ApplicationGrantRoleFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  MetadataToFlatEntityMapsKey<
    Exclude<ApplicationGrantRoleMetadataName, 'roleTarget'>
  >
>;

type ApplicationGrantRoleUniversalFlatEntityMaps = Pick<
  AllUniversalFlatEntityMaps,
  MetadataToFlatEntityMapsKey<ApplicationGrantRoleMetadataName>
>;

type RolePermissionUniversalFlatEntityMaps = Omit<
  ApplicationGrantRoleUniversalFlatEntityMaps,
  'flatRoleMaps' | 'flatRoleTargetMaps'
>;

type BuildApplicationGrantRoleFromToFlatEntityMapsArgs = {
  targetFlatApplication: Pick<FlatApplication, 'name' | 'universalIdentifier'>;
  requestedFlatRole: FlatRole;
  existingGrantRole:
    | { flatRole: FlatRole; flatRoleTarget: FlatRoleTarget }
    | undefined;
  workspaceCustomApplicationUniversalIdentifier: string;
  flatEntityMaps: ApplicationGrantRoleFlatEntityMaps;
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
  ApplicationGrantRoleMetadataName,
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
  flatEntityMaps: ApplicationGrantRoleFlatEntityMaps;
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

const findExistingGrantRoleUniversalFlatEntityMaps = ({
  existingGrantRole,
  flatEntityMaps,
}: BuildApplicationGrantRoleFromToFlatEntityMapsArgs): ApplicationGrantRoleUniversalFlatEntityMaps =>
  isDefined(existingGrantRole)
    ? {
        flatRoleMaps: toUniversalFlatEntityMaps([existingGrantRole.flatRole]),
        flatRoleTargetMaps: toUniversalFlatEntityMaps([
          existingGrantRole.flatRoleTarget,
        ]),
        ...findRolePermissionUniversalFlatEntityMaps({
          flatRole: existingGrantRole.flatRole,
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

const buildDesiredGrantRoleUniversalFlatEntityMaps = ({
  targetFlatApplication,
  requestedFlatRole,
  existingGrantRole,
  workspaceCustomApplicationUniversalIdentifier,
  flatEntityMaps,
  now,
}: BuildApplicationGrantRoleFromToFlatEntityMapsArgs): ApplicationGrantRoleUniversalFlatEntityMaps => {
  const grantRoleIdentity = isDefined(existingGrantRole)
    ? {
        universalIdentifier: existingGrantRole.flatRole.universalIdentifier,
        label: existingGrantRole.flatRole.label,
        createdAt: existingGrantRole.flatRole.createdAt,
      }
    : {
        universalIdentifier: getApplicationGrantRoleUniversalIdentifier({
          grantedApplicationUniversalIdentifier:
            targetFlatApplication.universalIdentifier,
          workspaceCustomApplicationUniversalIdentifier,
        }),
        label: computeApplicationGrantRoleLabel({
          applicationName: targetFlatApplication.name,
          flatRoleMaps: flatEntityMaps.flatRoleMaps,
        }),
        createdAt: now,
      };

  const grantRoleTargetIdentity = isDefined(existingGrantRole)
    ? {
        universalIdentifier:
          existingGrantRole.flatRoleTarget.universalIdentifier,
        createdAt: existingGrantRole.flatRoleTarget.createdAt,
      }
    : { universalIdentifier: v4(), createdAt: now };

  const grantRoleUniversalIdentifier = grantRoleIdentity.universalIdentifier;

  // Copies are keyed on their source, so a sync updates the previous copy in place
  const toCopyUniversalIdentifier = (sourceUniversalIdentifier: string) =>
    v5(sourceUniversalIdentifier, grantRoleUniversalIdentifier);

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
        rowLevelPermissionRuleUniversalIdentifiers: [],
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
        fieldPermission: (source) =>
          isDefined(source.rowLevelPermissionPredicateGroupUniversalIdentifier)
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
                rowLevelPermissionPredicateGroupUniversalIdentifier: null,
                rowLevelPermissionRuleUniversalIdentifier: null,
                canReadFieldValue: source.canReadFieldValue ?? null,
                canUpdateFieldValue: source.canUpdateFieldValue ?? null,
              },
        rolePermissionFlag: (source) => ({
          ...owner,
          universalIdentifier: toCopyUniversalIdentifier(
            source.universalIdentifier,
          ),
          permissionFlagUniversalIdentifier:
            source.permissionFlagUniversalIdentifier,
        }),
        // An application role is a limiting role, which carries no RLS
        rowLevelPermissionPredicateGroup: () => undefined,
        rowLevelPermissionPredicate: () => undefined,
      },
    }),
  };
};

// From is the current grant, to is the grant matching the requested role: the builder diffs them
export const buildApplicationGrantRoleFromToFlatEntityMaps = (
  args: BuildApplicationGrantRoleFromToFlatEntityMapsArgs,
): FromToAllUniversalFlatEntityMaps => {
  const from = findExistingGrantRoleUniversalFlatEntityMaps(args);
  const to = buildDesiredGrantRoleUniversalFlatEntityMaps(args);

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
