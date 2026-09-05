import { type RowLevelPermissionPredicateGroupManifest } from 'twenty-shared/application';

import { type RowLevelPermissionPredicateParent } from 'src/engine/core-modules/application/application-manifest/types/row-level-permission-predicate-parent.type';
import { type UniversalFlatRowLevelPermissionPredicateGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-predicate-group.type';

export const fromRowLevelPermissionPredicateGroupManifestToUniversalFlatRowLevelPermissionPredicateGroup =
  ({
    rowLevelPermissionPredicateGroupManifest,
    parent,
    applicationUniversalIdentifier,
    now,
  }: {
    rowLevelPermissionPredicateGroupManifest: RowLevelPermissionPredicateGroupManifest;
    parent: RowLevelPermissionPredicateParent;
    applicationUniversalIdentifier: string;
    now: string;
  }): UniversalFlatRowLevelPermissionPredicateGroup => {
    return {
      universalIdentifier:
        rowLevelPermissionPredicateGroupManifest.universalIdentifier,
      applicationUniversalIdentifier,
      roleUniversalIdentifier: parent.roleUniversalIdentifier ?? null,
      sharingRuleUniversalIdentifier:
        parent.sharingRuleUniversalIdentifier ?? null,
      objectMetadataUniversalIdentifier:
        rowLevelPermissionPredicateGroupManifest.objectUniversalIdentifier,
      logicalOperator: rowLevelPermissionPredicateGroupManifest.logicalOperator,
      parentRowLevelPermissionPredicateGroupUniversalIdentifier:
        rowLevelPermissionPredicateGroupManifest.parentPredicateGroupUniversalIdentifier ??
        null,
      positionInRowLevelPermissionPredicateGroup:
        rowLevelPermissionPredicateGroupManifest.position ?? null,
      childRowLevelPermissionPredicateGroupUniversalIdentifiers: [],
      rowLevelPermissionPredicateUniversalIdentifiers: [],
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
  };
