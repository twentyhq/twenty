import { type UniversalFlatRowLevelPermissionPredicate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-predicate.type';

export type RowLevelPermissionScope = Pick<
  UniversalFlatRowLevelPermissionPredicate,
  'roleUniversalIdentifier' | 'objectMetadataUniversalIdentifier'
>;

export const isSameRowLevelPermissionScope = ({
  scope,
  otherScope,
}: {
  scope: RowLevelPermissionScope;
  otherScope: RowLevelPermissionScope;
}): boolean =>
  scope.roleUniversalIdentifier === otherScope.roleUniversalIdentifier &&
  scope.objectMetadataUniversalIdentifier ===
    otherScope.objectMetadataUniversalIdentifier;
