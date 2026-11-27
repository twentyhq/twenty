import { computeDeterministicUuid } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { v5 } from 'uuid';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

export type StandaloneRoleHandoverTableName =
  | 'role'
  | 'objectPermission'
  | 'fieldPermission'
  | 'rolePermissionFlag'
  | 'rowLevelPermissionRule'
  | 'rowLevelPermissionPredicateGroup'
  | 'rowLevelPermissionPredicate';

export type StandaloneRoleHandoverRow = {
  tableName: StandaloneRoleHandoverTableName;
  id: string;
  universalIdentifier: string;
};

export type StandaloneRoleHandover = {
  flatRole: FlatRole;
  rows: StandaloneRoleHandoverRow[];
};

export type StandaloneRoleHandoverFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  | 'flatObjectPermissionMaps'
  | 'flatFieldPermissionMaps'
  | 'flatRolePermissionFlagMaps'
  | 'flatRowLevelPermissionRuleMaps'
  | 'flatRowLevelPermissionPredicateGroupMaps'
  | 'flatRowLevelPermissionPredicateMaps'
>;

export const getHandedOverRoleUniversalIdentifier = ({
  originalRoleUniversalIdentifier,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  originalRoleUniversalIdentifier: string;
  workspaceCustomApplicationUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'role',
    value: `${originalRoleUniversalIdentifier}:HANDED_OVER_TO_WORKSPACE`,
    applicationUniversalIdentifier:
      workspaceCustomApplicationUniversalIdentifier,
  });

// New universal identifiers let a later app version still declare the role without colliding with this one
export const planStandaloneRoleHandover = ({
  flatRole,
  workspaceCustomApplicationUniversalIdentifier,
  flatEntityMaps,
}: {
  flatRole: FlatRole;
  workspaceCustomApplicationUniversalIdentifier: string;
  flatEntityMaps: StandaloneRoleHandoverFlatEntityMaps;
}): StandaloneRoleHandover => {
  const handedOverRoleUniversalIdentifier =
    getHandedOverRoleUniversalIdentifier({
      originalRoleUniversalIdentifier: flatRole.universalIdentifier,
      workspaceCustomApplicationUniversalIdentifier,
    });

  const toRows = (
    tableName: StandaloneRoleHandoverTableName,
    flatEntityMaps: {
      byUniversalIdentifier: Partial<
        Record<string, { id: string; universalIdentifier: string }>
      >;
    },
    universalIdentifiers: string[],
  ): StandaloneRoleHandoverRow[] =>
    universalIdentifiers
      .map(
        (universalIdentifier) =>
          flatEntityMaps.byUniversalIdentifier[universalIdentifier],
      )
      .filter(isDefined)
      .map(({ id, universalIdentifier }) => ({
        tableName,
        id,
        universalIdentifier: v5(
          universalIdentifier,
          handedOverRoleUniversalIdentifier,
        ),
      }));

  return {
    flatRole,
    rows: [
      {
        tableName: 'role',
        id: flatRole.id,
        universalIdentifier: handedOverRoleUniversalIdentifier,
      },
      ...toRows(
        'objectPermission',
        flatEntityMaps.flatObjectPermissionMaps,
        flatRole.objectPermissionUniversalIdentifiers,
      ),
      ...toRows(
        'fieldPermission',
        flatEntityMaps.flatFieldPermissionMaps,
        flatRole.fieldPermissionUniversalIdentifiers,
      ),
      ...toRows(
        'rolePermissionFlag',
        flatEntityMaps.flatRolePermissionFlagMaps,
        flatRole.rolePermissionFlagUniversalIdentifiers,
      ),
      ...toRows(
        'rowLevelPermissionRule',
        flatEntityMaps.flatRowLevelPermissionRuleMaps,
        flatRole.rowLevelPermissionRuleUniversalIdentifiers,
      ),
      ...toRows(
        'rowLevelPermissionPredicateGroup',
        flatEntityMaps.flatRowLevelPermissionPredicateGroupMaps,
        flatRole.rowLevelPermissionPredicateGroupUniversalIdentifiers,
      ),
      ...toRows(
        'rowLevelPermissionPredicate',
        flatEntityMaps.flatRowLevelPermissionPredicateMaps,
        flatRole.rowLevelPermissionPredicateUniversalIdentifiers,
      ),
    ],
  };
};
