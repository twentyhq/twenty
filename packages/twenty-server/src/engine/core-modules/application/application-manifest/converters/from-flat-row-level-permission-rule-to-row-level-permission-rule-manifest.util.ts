import { type RowLevelPermissionRuleManifest } from 'twenty-shared/application';

import { type UniversalFlatRowLevelPermissionRule } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-rule.type';

export const fromFlatRowLevelPermissionRuleToRowLevelPermissionRuleManifest = ({
  flatRowLevelPermissionRule,
}: {
  flatRowLevelPermissionRule: Pick<
    UniversalFlatRowLevelPermissionRule,
    | 'universalIdentifier'
    | 'objectMetadataUniversalIdentifier'
    | 'canReadRecords'
    | 'canCreateRecords'
    | 'canUpdateRecords'
    | 'canSoftDeleteRecords'
    | 'canDestroyRecords'
  >;
}): Required<
  Omit<RowLevelPermissionRuleManifest, 'predicates' | 'predicateGroups'>
> => ({
  universalIdentifier: flatRowLevelPermissionRule.universalIdentifier,
  objectUniversalIdentifier:
    flatRowLevelPermissionRule.objectMetadataUniversalIdentifier,
  canReadRecords: flatRowLevelPermissionRule.canReadRecords,
  canCreateRecords: flatRowLevelPermissionRule.canCreateRecords,
  canUpdateRecords: flatRowLevelPermissionRule.canUpdateRecords,
  canSoftDeleteRecords: flatRowLevelPermissionRule.canSoftDeleteRecords,
  canDestroyRecords: flatRowLevelPermissionRule.canDestroyRecords,
});
