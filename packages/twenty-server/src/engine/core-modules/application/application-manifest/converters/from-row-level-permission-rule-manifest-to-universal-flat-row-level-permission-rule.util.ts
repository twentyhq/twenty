import { type RowLevelPermissionRuleManifest } from 'twenty-shared/application';

import { type UniversalFlatRowLevelPermissionRule } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-rule.type';

export const fromRowLevelPermissionRuleManifestToUniversalFlatRowLevelPermissionRule =
  ({
    rowLevelPermissionRuleManifest,
    roleUniversalIdentifier,
    applicationUniversalIdentifier,
    now,
  }: {
    rowLevelPermissionRuleManifest: RowLevelPermissionRuleManifest;
    roleUniversalIdentifier: string;
    applicationUniversalIdentifier: string;
    now: string;
  }): UniversalFlatRowLevelPermissionRule => ({
    universalIdentifier: rowLevelPermissionRuleManifest.universalIdentifier,
    applicationUniversalIdentifier,
    roleUniversalIdentifier,
    objectMetadataUniversalIdentifier:
      rowLevelPermissionRuleManifest.objectUniversalIdentifier,
    canReadRecords: rowLevelPermissionRuleManifest.canReadRecords ?? false,
    canCreateRecords: rowLevelPermissionRuleManifest.canCreateRecords ?? false,
    canUpdateRecords: rowLevelPermissionRuleManifest.canUpdateRecords ?? false,
    canSoftDeleteRecords:
      rowLevelPermissionRuleManifest.canSoftDeleteRecords ?? false,
    canDestroyRecords:
      rowLevelPermissionRuleManifest.canDestroyRecords ?? false,
    createdAt: now,
    updatedAt: now,
  });
