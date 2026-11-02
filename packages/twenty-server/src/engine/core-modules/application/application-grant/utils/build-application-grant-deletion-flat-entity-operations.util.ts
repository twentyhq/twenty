import { type ApplicationGrantFlatEntityOperations } from 'src/engine/core-modules/application/application-grant/utils/build-application-grant-flat-entity-operations.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-universal-identifier-in-universal-flat-entity-maps.util';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

const toDelete = <TFlatEntity>(flatEntityToDelete: TFlatEntity[]) => ({
  flatEntityToCreate: [],
  flatEntityToUpdate: [],
  flatEntityToDelete,
});

export const buildApplicationGrantDeletionFlatEntityOperations = ({
  grantFlatRole,
  flatEntityMaps,
}: {
  grantFlatRole: FlatRole;
  flatEntityMaps: Pick<
    AllFlatEntityMaps,
    | 'flatRoleTargetMaps'
    | 'flatObjectPermissionMaps'
    | 'flatFieldPermissionMaps'
    | 'flatRolePermissionFlagMaps'
    | 'flatRowLevelPermissionPredicateMaps'
    | 'flatRowLevelPermissionPredicateGroupMaps'
  >;
}): ApplicationGrantFlatEntityOperations => ({
  role: toDelete([grantFlatRole]),
  roleTarget: toDelete(
    findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps({
      flatEntityMaps: flatEntityMaps.flatRoleTargetMaps,
      universalIdentifiers: grantFlatRole.roleTargetUniversalIdentifiers,
    }),
  ),
  objectPermission: toDelete(
    findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps({
      flatEntityMaps: flatEntityMaps.flatObjectPermissionMaps,
      universalIdentifiers: grantFlatRole.objectPermissionUniversalIdentifiers,
    }),
  ),
  fieldPermission: toDelete(
    findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps({
      flatEntityMaps: flatEntityMaps.flatFieldPermissionMaps,
      universalIdentifiers: grantFlatRole.fieldPermissionUniversalIdentifiers,
    }),
  ),
  rolePermissionFlag: toDelete(
    findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps({
      flatEntityMaps: flatEntityMaps.flatRolePermissionFlagMaps,
      universalIdentifiers:
        grantFlatRole.rolePermissionFlagUniversalIdentifiers,
    }),
  ),
  rowLevelPermissionPredicate: toDelete(
    findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps({
      flatEntityMaps: flatEntityMaps.flatRowLevelPermissionPredicateMaps,
      universalIdentifiers:
        grantFlatRole.rowLevelPermissionPredicateUniversalIdentifiers,
    }),
  ),
  rowLevelPermissionPredicateGroup: toDelete(
    findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps({
      flatEntityMaps: flatEntityMaps.flatRowLevelPermissionPredicateGroupMaps,
      universalIdentifiers:
        grantFlatRole.rowLevelPermissionPredicateGroupUniversalIdentifiers,
    }),
  ),
});
