import { type RowLevelPermissionPredicateManifest } from 'twenty-shared/application';

import { type RowLevelPermissionPredicateParent } from 'src/engine/core-modules/application/application-manifest/types/row-level-permission-predicate-parent.type';
import { type UniversalFlatRowLevelPermissionPredicate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-predicate.type';

export const fromRowLevelPermissionPredicateManifestToUniversalFlatRowLevelPermissionPredicate =
  ({
    rowLevelPermissionPredicateManifest,
    parent,
    applicationUniversalIdentifier,
    now,
  }: {
    rowLevelPermissionPredicateManifest: RowLevelPermissionPredicateManifest;
    parent: RowLevelPermissionPredicateParent;
    applicationUniversalIdentifier: string;
    now: string;
  }): UniversalFlatRowLevelPermissionPredicate => {
    return {
      universalIdentifier:
        rowLevelPermissionPredicateManifest.universalIdentifier,
      applicationUniversalIdentifier,
      roleUniversalIdentifier: parent.roleUniversalIdentifier ?? null,
      sharingRuleUniversalIdentifier:
        parent.sharingRuleUniversalIdentifier ?? null,
      objectMetadataUniversalIdentifier:
        rowLevelPermissionPredicateManifest.objectUniversalIdentifier,
      fieldMetadataUniversalIdentifier:
        rowLevelPermissionPredicateManifest.fieldUniversalIdentifier,
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
      positionInRowLevelPermissionPredicateGroup:
        rowLevelPermissionPredicateManifest.position ?? null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
  };
