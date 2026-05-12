import { type RowLevelPermissionPredicateGroupManifest } from 'twenty-shared/application';

import { type UniversalFlatRowLevelPermissionPredicateGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-predicate-group.type';

export const fromRowLevelPermissionPredicateGroupManifestToUniversalFlatRowLevelPermissionPredicateGroup =
  ({
    predicateGroupManifest,
    roleUniversalIdentifier,
    applicationUniversalIdentifier,
    now,
  }: {
    predicateGroupManifest: RowLevelPermissionPredicateGroupManifest;
    roleUniversalIdentifier: string;
    applicationUniversalIdentifier: string;
    now: string;
  }): UniversalFlatRowLevelPermissionPredicateGroup => {
    return {
      universalIdentifier: predicateGroupManifest.universalIdentifier,
      applicationUniversalIdentifier,
      roleUniversalIdentifier,
      objectMetadataUniversalIdentifier:
        predicateGroupManifest.objectUniversalIdentifier,
      parentRowLevelPermissionPredicateGroupUniversalIdentifier:
        predicateGroupManifest.parentRowLevelPermissionPredicateGroupUniversalIdentifier ??
        null,
      logicalOperator: predicateGroupManifest.logicalOperator,
      positionInRowLevelPermissionPredicateGroup:
        predicateGroupManifest.positionInRowLevelPermissionPredicateGroup ??
        null,
      childRowLevelPermissionPredicateGroupUniversalIdentifiers: [],
      rowLevelPermissionPredicateUniversalIdentifiers: [],
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
  };
