import omit from 'lodash.omit';
import { getObjectPermissionUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { addLegacyRowLevelPermissionRuleGrantsToGrantRoleObjectPermissions } from 'src/engine/core-modules/application/application-grant-role/utils/add-legacy-row-level-permission-rule-grants-to-grant-role-object-permissions.util';
import { type MarketplaceApplicationRoleCloneFlatEntityMaps } from 'src/database/commands/upgrade-version-command/2-65/utils/build-marketplace-application-role-clone.util';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

type UniversalFlatObjectPermission =
  MetadataUniversalFlatEntity<'objectPermission'>;

export type MarketplaceApplicationRoleCleanup = {
  roleToUpdate: MetadataUniversalFlatEntity<'role'> | undefined;
  objectPermissionsToCreate: UniversalFlatObjectPermission[];
  objectPermissionsToUpdate: UniversalFlatObjectPermission[];
  fieldPermissionsToDelete: MetadataUniversalFlatEntity<'fieldPermission'>[];
  rowLevelPermissionRulesToDelete: MetadataUniversalFlatEntity<'rowLevelPermissionRule'>[];
  rowLevelPermissionPredicateGroupsToDelete: MetadataUniversalFlatEntity<'rowLevelPermissionPredicateGroup'>[];
  rowLevelPermissionPredicatesToDelete: MetadataUniversalFlatEntity<'rowLevelPermissionPredicate'>[];
};

const OBJECT_RECORDS_GRANTS = [
  'canReadObjectRecords',
  'canCreateObjectRecords',
  'canUpdateObjectRecords',
  'canSoftDeleteObjectRecords',
  'canDestroyObjectRecords',
] as const;

const findByUniversalIdentifiers = <TFlatEntity>(
  flatEntityMaps: {
    byUniversalIdentifier: Partial<Record<string, TFlatEntity>>;
  },
  universalIdentifiers: string[],
): TFlatEntity[] =>
  universalIdentifiers
    .map(
      (universalIdentifier) =>
        flatEntityMaps.byUniversalIdentifier[universalIdentifier],
    )
    .filter(isDefined);

// Rule grants move onto object permissions before the rules go, so the app keeps them at object level
export const buildMarketplaceApplicationRoleCleanup = ({
  originalFlatRole,
  flatEntityMaps,
  now,
}: {
  originalFlatRole: FlatRole;
  flatEntityMaps: MarketplaceApplicationRoleCloneFlatEntityMaps;
  now: string;
}): MarketplaceApplicationRoleCleanup => {
  const rules = findByUniversalIdentifiers(
    flatEntityMaps.flatRowLevelPermissionRuleMaps,
    originalFlatRole.rowLevelPermissionRuleUniversalIdentifiers,
  );

  const existingObjectPermissions: UniversalFlatObjectPermission[] =
    findByUniversalIdentifiers(
      flatEntityMaps.flatObjectPermissionMaps,
      originalFlatRole.objectPermissionUniversalIdentifiers,
    ).map((flatObjectPermission) =>
      omit(flatObjectPermission, [
        'id',
        'applicationId',
        'workspaceId',
        'roleId',
      ]),
    );

  const existingObjectPermissionByUniversalIdentifier = new Map(
    existingObjectPermissions.map((objectPermission) => [
      objectPermission.universalIdentifier,
      objectPermission,
    ]),
  );

  const objectPermissions =
    addLegacyRowLevelPermissionRuleGrantsToGrantRoleObjectPermissions({
      grantRoleFlatObjectPermissions: existingObjectPermissions,
      requestedRoleFlatRowLevelPermissionRules: rules,
      buildGrantRoleFlatObjectPermission: ({
        objectMetadataUniversalIdentifier,
        grants,
      }) => ({
        universalIdentifier: getObjectPermissionUniversalIdentifier({
          applicationUniversalIdentifier:
            originalFlatRole.applicationUniversalIdentifier,
          roleUniversalIdentifier: originalFlatRole.universalIdentifier,
          objectUniversalIdentifier: objectMetadataUniversalIdentifier,
        }),
        applicationUniversalIdentifier:
          originalFlatRole.applicationUniversalIdentifier,
        roleUniversalIdentifier: originalFlatRole.universalIdentifier,
        objectMetadataUniversalIdentifier,
        ...grants,
        createdAt: now,
        updatedAt: now,
      }),
    });

  const objectPermissionsToCreate: UniversalFlatObjectPermission[] = [];
  const objectPermissionsToUpdate: UniversalFlatObjectPermission[] = [];

  for (const objectPermission of objectPermissions) {
    const existingObjectPermission =
      existingObjectPermissionByUniversalIdentifier.get(
        objectPermission.universalIdentifier,
      );

    if (!isDefined(existingObjectPermission)) {
      objectPermissionsToCreate.push(objectPermission);
      continue;
    }

    const hasGrantChanged = OBJECT_RECORDS_GRANTS.some(
      (grant) =>
        (objectPermission[grant] ?? null) !==
        (existingObjectPermission[grant] ?? null),
    );

    if (hasGrantChanged) {
      objectPermissionsToUpdate.push({ ...objectPermission, updatedAt: now });
    }
  }

  const isAssignableOutsideAgents =
    originalFlatRole.canBeAssignedToUsers ||
    originalFlatRole.canBeAssignedToApiKeys;

  return {
    roleToUpdate: isAssignableOutsideAgents
      ? {
          ...omit(originalFlatRole, ['id', 'applicationId', 'workspaceId']),
          canBeAssignedToUsers: false,
          canBeAssignedToApiKeys: false,
          updatedAt: now,
        }
      : undefined,
    objectPermissionsToCreate,
    objectPermissionsToUpdate,
    fieldPermissionsToDelete: findByUniversalIdentifiers(
      flatEntityMaps.flatFieldPermissionMaps,
      originalFlatRole.fieldPermissionUniversalIdentifiers,
    ),
    rowLevelPermissionRulesToDelete: rules,
    rowLevelPermissionPredicateGroupsToDelete: findByUniversalIdentifiers(
      flatEntityMaps.flatRowLevelPermissionPredicateGroupMaps,
      originalFlatRole.rowLevelPermissionPredicateGroupUniversalIdentifiers,
    ),
    rowLevelPermissionPredicatesToDelete: findByUniversalIdentifiers(
      flatEntityMaps.flatRowLevelPermissionPredicateMaps,
      originalFlatRole.rowLevelPermissionPredicateUniversalIdentifiers,
    ),
  };
};
