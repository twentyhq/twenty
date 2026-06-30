import { type RowLevelPermissionPredicateGroupManifest } from 'twenty-shared/application';

import { type UniversalFlatRowLevelPermissionPredicateGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-predicate-group.type';

export const fromRowLevelPermissionPredicateGroupManifestToUniversalFlatRowLevelPermissionPredicateGroup =
  ({
    rowLevelPermissionPredicateGroupManifest,
    roleUniversalIdentifier,
    applicationUniversalIdentifier,
    now,
  }: {
    rowLevelPermissionPredicateGroupManifest: RowLevelPermissionPredicateGroupManifest;
    roleUniversalIdentifier: string;
    applicationUniversalIdentifier: string;
    now: string;
  }): UniversalFlatRowLevelPermissionPredicateGroup => {
    return {
      universalIdentifier:
        rowLevelPermissionPredicateGroupManifest.universalIdentifier,
      applicationUniversalIdentifier,
      roleUniversalIdentifier,
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
