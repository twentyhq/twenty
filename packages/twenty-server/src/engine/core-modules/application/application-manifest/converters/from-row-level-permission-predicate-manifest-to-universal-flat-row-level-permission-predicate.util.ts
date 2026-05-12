import { type RowLevelPermissionPredicateManifest } from 'twenty-shared/application';

import { type UniversalFlatRowLevelPermissionPredicate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-predicate.type';

export const fromRowLevelPermissionPredicateManifestToUniversalFlatRowLevelPermissionPredicate =
  ({
    predicateManifest,
    roleUniversalIdentifier,
    applicationUniversalIdentifier,
    now,
  }: {
    predicateManifest: RowLevelPermissionPredicateManifest;
    roleUniversalIdentifier: string;
    applicationUniversalIdentifier: string;
    now: string;
  }): UniversalFlatRowLevelPermissionPredicate => {
    return {
      universalIdentifier: predicateManifest.universalIdentifier,
      applicationUniversalIdentifier,
      roleUniversalIdentifier,
      objectMetadataUniversalIdentifier:
        predicateManifest.objectUniversalIdentifier,
      fieldMetadataUniversalIdentifier:
        predicateManifest.fieldUniversalIdentifier,
      operand: predicateManifest.operand,
      value: predicateManifest.value ?? null,
      subFieldName: predicateManifest.subFieldName ?? null,
      workspaceMemberFieldMetadataUniversalIdentifier:
        predicateManifest.workspaceMemberFieldUniversalIdentifier ?? null,
      workspaceMemberSubFieldName:
        predicateManifest.workspaceMemberSubFieldName ?? null,
      rowLevelPermissionPredicateGroupUniversalIdentifier:
        predicateManifest.rowLevelPermissionPredicateGroupUniversalIdentifier ??
        null,
      positionInRowLevelPermissionPredicateGroup:
        predicateManifest.positionInRowLevelPermissionPredicateGroup ?? null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
  };
