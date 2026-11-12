import { type DeprecatedRowLevelPermissionPredicateManifest } from 'twenty-shared/application';

import { type UniversalFlatRowLevelPermissionPredicate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-predicate.type';

export const fromRowLevelPermissionPredicateManifestToUniversalFlatRowLevelPermissionPredicate =
  ({
    rowLevelPermissionPredicateManifest,
    roleUniversalIdentifier,
    applicationUniversalIdentifier,
    now,
  }: {
    rowLevelPermissionPredicateManifest: DeprecatedRowLevelPermissionPredicateManifest;
    roleUniversalIdentifier: string;
    applicationUniversalIdentifier: string;
    now: string;
  }): UniversalFlatRowLevelPermissionPredicate => {
    return {
      universalIdentifier:
        rowLevelPermissionPredicateManifest.universalIdentifier,
      applicationUniversalIdentifier,
      roleUniversalIdentifier,
      objectMetadataUniversalIdentifier:
        rowLevelPermissionPredicateManifest.objectUniversalIdentifier,
      fieldMetadataUniversalIdentifier:
        rowLevelPermissionPredicateManifest.fieldUniversalIdentifier,
      relationFieldMetadataUniversalIdentifier: null,
      operand: rowLevelPermissionPredicateManifest.operand,
      value: rowLevelPermissionPredicateManifest.value ?? null,
      subFieldName: rowLevelPermissionPredicateManifest.subFieldName ?? null,
      workspaceMemberFieldMetadataUniversalIdentifier:
        rowLevelPermissionPredicateManifest.workspaceMemberFieldUniversalIdentifier ??
        null,
      workspaceMemberSubFieldName:
        rowLevelPermissionPredicateManifest.workspaceMemberSubFieldName ?? null,
      rowLevelPermissionPredicateGroupUniversalIdentifier:
        rowLevelPermissionPredicateManifest.predicateGroupUniversalIdentifier ??
        null,
      rowLevelPermissionRuleUniversalIdentifier: null,
      positionInRowLevelPermissionPredicateGroup:
        rowLevelPermissionPredicateManifest.position ?? null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
  };
