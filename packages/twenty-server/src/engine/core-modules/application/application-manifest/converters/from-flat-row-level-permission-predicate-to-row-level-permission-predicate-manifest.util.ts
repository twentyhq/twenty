import { type RowLevelPermissionPredicateManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type UniversalFlatRowLevelPermissionPredicate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-predicate.type';

export const fromFlatRowLevelPermissionPredicateToRowLevelPermissionPredicateManifest =
  ({
    flatRowLevelPermissionPredicate,
  }: {
    flatRowLevelPermissionPredicate: UniversalFlatRowLevelPermissionPredicate;
  }): RowLevelPermissionPredicateManifest => ({
    universalIdentifier: flatRowLevelPermissionPredicate.universalIdentifier,
    objectUniversalIdentifier:
      flatRowLevelPermissionPredicate.objectMetadataUniversalIdentifier,
    fieldUniversalIdentifier:
      flatRowLevelPermissionPredicate.fieldMetadataUniversalIdentifier,
    operand: flatRowLevelPermissionPredicate.operand,
    ...(isDefined(flatRowLevelPermissionPredicate.value)
      ? { value: flatRowLevelPermissionPredicate.value }
      : {}),
    ...(isDefined(flatRowLevelPermissionPredicate.subFieldName)
      ? { subFieldName: flatRowLevelPermissionPredicate.subFieldName }
      : {}),
    ...(isDefined(
      flatRowLevelPermissionPredicate.workspaceMemberFieldMetadataUniversalIdentifier,
    )
      ? {
          workspaceMemberFieldUniversalIdentifier:
            flatRowLevelPermissionPredicate.workspaceMemberFieldMetadataUniversalIdentifier,
        }
      : {}),
    ...(isDefined(flatRowLevelPermissionPredicate.workspaceMemberSubFieldName)
      ? {
          workspaceMemberSubFieldName:
            flatRowLevelPermissionPredicate.workspaceMemberSubFieldName,
        }
      : {}),
    ...(isDefined(
      flatRowLevelPermissionPredicate.rowLevelPermissionPredicateGroupUniversalIdentifier,
    )
      ? {
          predicateGroupUniversalIdentifier:
            flatRowLevelPermissionPredicate.rowLevelPermissionPredicateGroupUniversalIdentifier,
        }
      : {}),
    ...(isDefined(
      flatRowLevelPermissionPredicate.positionInRowLevelPermissionPredicateGroup,
    )
      ? {
          position:
            flatRowLevelPermissionPredicate.positionInRowLevelPermissionPredicateGroup,
        }
      : {}),
  });
