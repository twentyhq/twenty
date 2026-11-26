import omit from 'lodash.omit';
import { computeDeterministicUuid } from 'twenty-shared/application';
import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { v5 } from 'uuid';

import {
  type ApplicationGrantRoleFlatEntityMaps,
  findRolePermissionUniversalFlatEntityMaps,
} from 'src/engine/core-modules/application/application-grant-role/utils/build-application-grant-role-from-to-flat-entity-maps.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { getSubUniversalFlatEntityByUniversalIdentifiersMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/get-sub-universal-flat-entity-by-universal-identifiers-maps-or-throw.util';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { getUniversalFlatEntityEmptyForeignKeyAggregators } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/reset-universal-flat-entity-foreign-key-aggregators.util';

export type MarketplaceApplicationRoleCloneFlatEntityMaps =
  ApplicationGrantRoleFlatEntityMaps &
    Pick<AllFlatEntityMaps, 'flatRowLevelPermissionRuleMaps'>;

export type MarketplaceApplicationRoleClone = {
  role: MetadataUniversalFlatEntity<'role'> & { id: string };
  objectPermissions: MetadataUniversalFlatEntity<'objectPermission'>[];
  fieldPermissions: MetadataUniversalFlatEntity<'fieldPermission'>[];
  rolePermissionFlags: MetadataUniversalFlatEntity<'rolePermissionFlag'>[];
  rowLevelPermissionRules: MetadataUniversalFlatEntity<'rowLevelPermissionRule'>[];
  rowLevelPermissionPredicateGroups: MetadataUniversalFlatEntity<'rowLevelPermissionPredicateGroup'>[];
  rowLevelPermissionPredicates: MetadataUniversalFlatEntity<'rowLevelPermissionPredicate'>[];
};

type CloneAssignability = Pick<
  FlatRole,
  'canBeAssignedToUsers' | 'canBeAssignedToApiKeys' | 'canBeAssignedToAgents'
>;

const FLAT_ONLY_PROPERTIES = ['id', 'applicationId', 'workspaceId'] as const;

export const getMarketplaceApplicationRoleCloneUniversalIdentifier = ({
  originalRoleUniversalIdentifier,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  originalRoleUniversalIdentifier: string;
  workspaceCustomApplicationUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'role',
    value: `${originalRoleUniversalIdentifier}:MARKETPLACE_APPLICATION_ROLE_CLONE`,
    applicationUniversalIdentifier:
      workspaceCustomApplicationUniversalIdentifier,
  });

export const computeMarketplaceApplicationRoleCloneLabel = ({
  originalLabel,
  takenLabels,
}: {
  originalLabel: string;
  takenLabels: Set<string>;
}): string => {
  const baseLabel = `${originalLabel} copy`;
  let label = baseLabel;

  for (let suffix = 2; takenLabels.has(label); suffix++) {
    label = `${baseLabel} ${suffix}`;
  }

  return label;
};

export const buildMarketplaceApplicationRoleClone = ({
  originalFlatRole,
  cloneRoleId,
  label,
  assignability,
  workspaceCustomApplicationUniversalIdentifier,
  flatEntityMaps,
  now,
}: {
  originalFlatRole: FlatRole;
  cloneRoleId: string;
  label: string;
  assignability: CloneAssignability;
  workspaceCustomApplicationUniversalIdentifier: string;
  flatEntityMaps: MarketplaceApplicationRoleCloneFlatEntityMaps;
  now: string;
}): MarketplaceApplicationRoleClone => {
  const cloneRoleUniversalIdentifier =
    getMarketplaceApplicationRoleCloneUniversalIdentifier({
      originalRoleUniversalIdentifier: originalFlatRole.universalIdentifier,
      workspaceCustomApplicationUniversalIdentifier,
    });

  // Copies are keyed on their source, so a later run finds the same rows
  const toCloneUniversalIdentifier = (sourceUniversalIdentifier: string) =>
    v5(sourceUniversalIdentifier, cloneRoleUniversalIdentifier);

  const toCloneReference = (sourceUniversalIdentifier: string | null) =>
    isDefined(sourceUniversalIdentifier)
      ? toCloneUniversalIdentifier(sourceUniversalIdentifier)
      : null;

  const copy = <T extends AllMetadataName>(
    metadataName: T,
    source: MetadataFlatEntity<T>,
  ) =>
    ({
      ...omit(source, FLAT_ONLY_PROPERTIES),
      ...getUniversalFlatEntityEmptyForeignKeyAggregators({ metadataName }),
      universalIdentifier: toCloneUniversalIdentifier(
        source.universalIdentifier,
      ),
      applicationUniversalIdentifier:
        workspaceCustomApplicationUniversalIdentifier,
      roleUniversalIdentifier: cloneRoleUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
    }) as unknown as MetadataUniversalFlatEntity<T>;

  const rolePermissionUniversalFlatEntityMaps =
    findRolePermissionUniversalFlatEntityMaps({
      flatRole: originalFlatRole,
      flatEntityMaps,
      mappers: {
        objectPermission: (source) => copy('objectPermission', source),
        rolePermissionFlag: (source) => copy('rolePermissionFlag', source),
        fieldPermission: (source) => ({
          ...copy('fieldPermission', source),
          rowLevelPermissionPredicateGroupUniversalIdentifier: toCloneReference(
            source.rowLevelPermissionPredicateGroupUniversalIdentifier,
          ),
          rowLevelPermissionRuleUniversalIdentifier: toCloneReference(
            source.rowLevelPermissionRuleUniversalIdentifier,
          ),
        }),
        rowLevelPermissionPredicateGroup: (source) =>
          isDefined(source.deletedAt)
            ? undefined
            : {
                ...copy('rowLevelPermissionPredicateGroup', source),
                parentRowLevelPermissionPredicateGroupUniversalIdentifier:
                  toCloneReference(
                    source.parentRowLevelPermissionPredicateGroupUniversalIdentifier,
                  ),
                rowLevelPermissionRuleUniversalIdentifier: toCloneReference(
                  source.rowLevelPermissionRuleUniversalIdentifier,
                ),
              },
        rowLevelPermissionPredicate: (source) =>
          isDefined(source.deletedAt)
            ? undefined
            : {
                ...copy('rowLevelPermissionPredicate', source),
                rowLevelPermissionPredicateGroupUniversalIdentifier:
                  toCloneReference(
                    source.rowLevelPermissionPredicateGroupUniversalIdentifier,
                  ),
                rowLevelPermissionRuleUniversalIdentifier: toCloneReference(
                  source.rowLevelPermissionRuleUniversalIdentifier,
                ),
              },
      },
    });

  const rowLevelPermissionRules = Object.values(
    getSubUniversalFlatEntityByUniversalIdentifiersMapsOrThrow({
      universalFlatEntityMaps: flatEntityMaps.flatRowLevelPermissionRuleMaps,
      universalIdentifiers:
        originalFlatRole.rowLevelPermissionRuleUniversalIdentifiers,
    }).byUniversalIdentifier,
  )
    .filter(isDefined)
    .map((source) => copy('rowLevelPermissionRule', source));

  const toValues = <TUniversalFlatEntity>(universalFlatEntityMaps: {
    byUniversalIdentifier: Partial<Record<string, TUniversalFlatEntity>>;
  }) =>
    Object.values(universalFlatEntityMaps.byUniversalIdentifier).filter(
      isDefined,
    );

  return {
    role: {
      ...omit(originalFlatRole, FLAT_ONLY_PROPERTIES),
      ...getUniversalFlatEntityEmptyForeignKeyAggregators({
        metadataName: 'role',
      }),
      ...assignability,
      id: cloneRoleId,
      universalIdentifier: cloneRoleUniversalIdentifier,
      applicationUniversalIdentifier:
        workspaceCustomApplicationUniversalIdentifier,
      label,
      isSystemSideEffect: false,
      canBeAssignedToApplications: false,
      createdAt: now,
      updatedAt: now,
    } as unknown as MarketplaceApplicationRoleClone['role'],
    objectPermissions: toValues(
      rolePermissionUniversalFlatEntityMaps.flatObjectPermissionMaps,
    ),
    fieldPermissions: toValues(
      rolePermissionUniversalFlatEntityMaps.flatFieldPermissionMaps,
    ),
    rolePermissionFlags: toValues(
      rolePermissionUniversalFlatEntityMaps.flatRolePermissionFlagMaps,
    ),
    rowLevelPermissionRules,
    rowLevelPermissionPredicateGroups: toValues(
      rolePermissionUniversalFlatEntityMaps.flatRowLevelPermissionPredicateGroupMaps,
    ),
    rowLevelPermissionPredicates: toValues(
      rolePermissionUniversalFlatEntityMaps.flatRowLevelPermissionPredicateMaps,
    ),
  };
};
