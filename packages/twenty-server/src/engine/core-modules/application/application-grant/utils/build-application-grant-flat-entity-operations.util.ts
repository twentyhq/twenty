import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { v4, v5 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { computeApplicationGrantRoleLabel } from 'src/engine/core-modules/application/application-grant/utils/compute-application-grant-role-label.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import {
  type AllFlatEntityOperationByMetadataName,
  type FlatEntityToCreateDeleteUpdate,
} from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-universal-identifier-in-universal-flat-entity-maps.util';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';

export type ApplicationGrantFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  | 'flatRoleMaps'
  | 'flatObjectPermissionMaps'
  | 'flatFieldPermissionMaps'
  | 'flatRolePermissionFlagMaps'
  | 'flatRowLevelPermissionPredicateMaps'
  | 'flatRowLevelPermissionPredicateGroupMaps'
>;

export type ApplicationGrantFlatEntityOperations = Required<
  Pick<
    AllFlatEntityOperationByMetadataName,
    | 'role'
    | 'objectPermission'
    | 'fieldPermission'
    | 'rolePermissionFlag'
    | 'rowLevelPermissionPredicate'
    | 'rowLevelPermissionPredicateGroup'
    | 'roleTarget'
  >
>;

type RoleCopiedProperties = Pick<
  UniversalFlatRole,
  | 'description'
  | 'icon'
  | 'canUpdateAllSettings'
  | 'canAccessAllTools'
  | 'canAccessAllAgentChatChannels'
  | 'canReadAllObjectRecords'
  | 'canUpdateAllObjectRecords'
  | 'canSoftDeleteAllObjectRecords'
  | 'canDestroyAllObjectRecords'
>;

const pickRoleCopiedProperties = (
  flatRole: FlatRole,
): RoleCopiedProperties => ({
  description: flatRole.description,
  icon: flatRole.icon,
  canUpdateAllSettings: flatRole.canUpdateAllSettings,
  canAccessAllTools: flatRole.canAccessAllTools,
  canAccessAllAgentChatChannels: flatRole.canAccessAllAgentChatChannels,
  canReadAllObjectRecords: flatRole.canReadAllObjectRecords,
  canUpdateAllObjectRecords: flatRole.canUpdateAllObjectRecords,
  canSoftDeleteAllObjectRecords: flatRole.canSoftDeleteAllObjectRecords,
  canDestroyAllObjectRecords: flatRole.canDestroyAllObjectRecords,
});

const diffGrantFlatEntities = <TMetadataName extends AllMetadataName>({
  desiredUniversalFlatEntities,
  existingFlatEntities,
}: {
  desiredUniversalFlatEntities: MetadataUniversalFlatEntity<TMetadataName>[];
  existingFlatEntities: MetadataFlatEntity<TMetadataName>[];
}): FlatEntityToCreateDeleteUpdate<TMetadataName> => {
  const existingByUniversalIdentifier = new Map(
    existingFlatEntities.map((existingFlatEntity) => [
      existingFlatEntity.universalIdentifier,
      existingFlatEntity,
    ]),
  );
  const desiredUniversalIdentifiers = new Set(
    desiredUniversalFlatEntities.map(
      ({ universalIdentifier }) => universalIdentifier,
    ),
  );

  const flatEntityToCreate: MetadataUniversalFlatEntity<TMetadataName>[] = [];
  const flatEntityToUpdate: MetadataUniversalFlatEntity<TMetadataName>[] = [];

  for (const desiredUniversalFlatEntity of desiredUniversalFlatEntities) {
    const existingFlatEntity = existingByUniversalIdentifier.get(
      desiredUniversalFlatEntity.universalIdentifier,
    );

    if (!isDefined(existingFlatEntity)) {
      flatEntityToCreate.push(desiredUniversalFlatEntity);
      continue;
    }

    flatEntityToUpdate.push({
      ...existingFlatEntity,
      ...desiredUniversalFlatEntity,
      createdAt: existingFlatEntity.createdAt,
    });
  }

  return {
    flatEntityToCreate,
    flatEntityToUpdate,
    flatEntityToDelete: existingFlatEntities.filter(
      ({ universalIdentifier }) =>
        !desiredUniversalIdentifiers.has(universalIdentifier),
    ),
  };
};

// Copies are keyed on their source, so each sync diffs against the previous copy
// instead of recreating it
const buildCopyUniversalIdentifier = ({
  sourceUniversalIdentifier,
  grantRoleUniversalIdentifier,
}: {
  sourceUniversalIdentifier: string;
  grantRoleUniversalIdentifier: string;
}) => v5(sourceUniversalIdentifier, grantRoleUniversalIdentifier);

export const buildApplicationGrantFlatEntityOperations = ({
  targetFlatApplication,
  requestedFlatRole,
  existingGrantFlatRole,
  existingGrantFlatRoleTarget,
  workspaceCustomApplicationUniversalIdentifier,
  flatEntityMaps,
  now,
}: {
  targetFlatApplication: Pick<FlatApplication, 'name' | 'universalIdentifier'>;
  requestedFlatRole: FlatRole;
  existingGrantFlatRole: FlatRole | undefined;
  existingGrantFlatRoleTarget: FlatRoleTarget | undefined;
  workspaceCustomApplicationUniversalIdentifier: string;
  flatEntityMaps: ApplicationGrantFlatEntityMaps;
  now: string;
}): ApplicationGrantFlatEntityOperations => {
  const grantRoleUniversalIdentifier =
    existingGrantFlatRole?.universalIdentifier ?? v4();

  const toCopyUniversalIdentifier = (sourceUniversalIdentifier: string) =>
    buildCopyUniversalIdentifier({
      sourceUniversalIdentifier,
      grantRoleUniversalIdentifier,
    });

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

  const findCopiedFlatEntities = <TFlatEntity extends SyncableFlatEntity>(
    flatEntityMaps: FlatEntityMaps<TFlatEntity>,
    getUniversalIdentifiers: (flatRole: FlatRole) => string[],
  ) => ({
    requested: findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps(
      {
        flatEntityMaps,
        universalIdentifiers: getUniversalIdentifiers(requestedFlatRole),
      },
    ),
    existing: isDefined(existingGrantFlatRole)
      ? findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps({
          flatEntityMaps,
          universalIdentifiers: getUniversalIdentifiers(existingGrantFlatRole),
        })
      : [],
  });

  const objectPermissions = findCopiedFlatEntities(
    flatEntityMaps.flatObjectPermissionMaps,
    (flatRole) => flatRole.objectPermissionUniversalIdentifiers,
  );
  const fieldPermissions = findCopiedFlatEntities(
    flatEntityMaps.flatFieldPermissionMaps,
    (flatRole) => flatRole.fieldPermissionUniversalIdentifiers,
  );
  const rolePermissionFlags = findCopiedFlatEntities(
    flatEntityMaps.flatRolePermissionFlagMaps,
    (flatRole) => flatRole.rolePermissionFlagUniversalIdentifiers,
  );
  const rowLevelPermissionPredicates = findCopiedFlatEntities(
    flatEntityMaps.flatRowLevelPermissionPredicateMaps,
    (flatRole) => flatRole.rowLevelPermissionPredicateUniversalIdentifiers,
  );
  const rowLevelPermissionPredicateGroups = findCopiedFlatEntities(
    flatEntityMaps.flatRowLevelPermissionPredicateGroupMaps,
    (flatRole) => flatRole.rowLevelPermissionPredicateGroupUniversalIdentifiers,
  );

  const role: ApplicationGrantFlatEntityOperations['role'] = isDefined(
    existingGrantFlatRole,
  )
    ? {
        flatEntityToCreate: [],
        flatEntityToUpdate: [
          {
            ...existingGrantFlatRole,
            ...pickRoleCopiedProperties(requestedFlatRole),
            updatedAt: now,
          },
        ],
        flatEntityToDelete: [],
      }
    : {
        flatEntityToCreate: [
          {
            ...pickRoleCopiedProperties(requestedFlatRole),
            universalIdentifier: grantRoleUniversalIdentifier,
            applicationUniversalIdentifier:
              workspaceCustomApplicationUniversalIdentifier,
            label: computeApplicationGrantRoleLabel({
              applicationName: targetFlatApplication.name,
              flatRoleMaps: flatEntityMaps.flatRoleMaps,
            }),
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
            createdAt: now,
            updatedAt: now,
          },
        ],
        flatEntityToUpdate: [],
        flatEntityToDelete: [],
      };

  const roleTarget: ApplicationGrantFlatEntityOperations['roleTarget'] = {
    flatEntityToCreate: isDefined(existingGrantFlatRoleTarget)
      ? []
      : [
          {
            ...owner,
            universalIdentifier: v4(),
            userWorkspaceId: null,
            agentUniversalIdentifier: null,
            apiKeyId: null,
            webhookUniversalIdentifier: null,
            targetApplicationUniversalIdentifier:
              targetFlatApplication.universalIdentifier,
          },
        ],
    flatEntityToUpdate: [],
    flatEntityToDelete: [],
  };

  return {
    role,
    roleTarget,
    objectPermission: diffGrantFlatEntities<'objectPermission'>({
      existingFlatEntities: objectPermissions.existing,
      desiredUniversalFlatEntities: objectPermissions.requested.map(
        (requested) => ({
          ...owner,
          universalIdentifier: toCopyUniversalIdentifier(
            requested.universalIdentifier,
          ),
          objectMetadataUniversalIdentifier:
            requested.objectMetadataUniversalIdentifier,
          canReadObjectRecords: requested.canReadObjectRecords ?? null,
          canUpdateObjectRecords: requested.canUpdateObjectRecords ?? null,
          canSoftDeleteObjectRecords:
            requested.canSoftDeleteObjectRecords ?? null,
          canDestroyObjectRecords: requested.canDestroyObjectRecords ?? null,
        }),
      ),
    }),
    fieldPermission: diffGrantFlatEntities<'fieldPermission'>({
      existingFlatEntities: fieldPermissions.existing,
      desiredUniversalFlatEntities: fieldPermissions.requested.map(
        (requested) => ({
          ...owner,
          universalIdentifier: toCopyUniversalIdentifier(
            requested.universalIdentifier,
          ),
          objectMetadataUniversalIdentifier:
            requested.objectMetadataUniversalIdentifier,
          fieldMetadataUniversalIdentifier:
            requested.fieldMetadataUniversalIdentifier,
          canReadFieldValue: requested.canReadFieldValue ?? null,
          canUpdateFieldValue: requested.canUpdateFieldValue ?? null,
        }),
      ),
    }),
    rolePermissionFlag: diffGrantFlatEntities<'rolePermissionFlag'>({
      existingFlatEntities: rolePermissionFlags.existing,
      desiredUniversalFlatEntities: rolePermissionFlags.requested.map(
        (requested) => ({
          ...owner,
          universalIdentifier: toCopyUniversalIdentifier(
            requested.universalIdentifier,
          ),
          permissionFlagUniversalIdentifier:
            requested.permissionFlagUniversalIdentifier,
        }),
      ),
    }),
    rowLevelPermissionPredicateGroup:
      diffGrantFlatEntities<'rowLevelPermissionPredicateGroup'>({
        existingFlatEntities: rowLevelPermissionPredicateGroups.existing,
        desiredUniversalFlatEntities:
          rowLevelPermissionPredicateGroups.requested
            .filter((requested) => !isDefined(requested.deletedAt))
            .map((requested) => ({
              ...owner,
              universalIdentifier: toCopyUniversalIdentifier(
                requested.universalIdentifier,
              ),
              objectMetadataUniversalIdentifier:
                requested.objectMetadataUniversalIdentifier,
              logicalOperator: requested.logicalOperator,
              parentRowLevelPermissionPredicateGroupUniversalIdentifier:
                toNullableCopyUniversalIdentifier(
                  requested.parentRowLevelPermissionPredicateGroupUniversalIdentifier,
                ),
              positionInRowLevelPermissionPredicateGroup:
                requested.positionInRowLevelPermissionPredicateGroup,
              childRowLevelPermissionPredicateGroupUniversalIdentifiers: [],
              rowLevelPermissionPredicateUniversalIdentifiers: [],
              deletedAt: null,
            })),
      }),
    rowLevelPermissionPredicate:
      diffGrantFlatEntities<'rowLevelPermissionPredicate'>({
        existingFlatEntities: rowLevelPermissionPredicates.existing,
        desiredUniversalFlatEntities: rowLevelPermissionPredicates.requested
          .filter((requested) => !isDefined(requested.deletedAt))
          .map((requested) => ({
            ...owner,
            universalIdentifier: toCopyUniversalIdentifier(
              requested.universalIdentifier,
            ),
            objectMetadataUniversalIdentifier:
              requested.objectMetadataUniversalIdentifier,
            fieldMetadataUniversalIdentifier:
              requested.fieldMetadataUniversalIdentifier,
            relationFieldMetadataUniversalIdentifier:
              requested.relationFieldMetadataUniversalIdentifier,
            operand: requested.operand,
            value: requested.value,
            subFieldName: requested.subFieldName,
            workspaceMemberFieldMetadataUniversalIdentifier:
              requested.workspaceMemberFieldMetadataUniversalIdentifier,
            workspaceMemberSubFieldName: requested.workspaceMemberSubFieldName,
            rowLevelPermissionPredicateGroupUniversalIdentifier:
              toNullableCopyUniversalIdentifier(
                requested.rowLevelPermissionPredicateGroupUniversalIdentifier,
              ),
            positionInRowLevelPermissionPredicateGroup:
              requested.positionInRowLevelPermissionPredicateGroup,
            deletedAt: null,
          })),
      }),
  };
};
