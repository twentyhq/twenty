import { type UniversalFlatObjectPermission } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-permission.type';
import { type UniversalFlatRowLevelPermissionRule } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-rule.type';

// TODO(@charlesBochet): remove once the export declares rules, the legacy shape can only carry their grants on the object
export const addRowLevelPermissionRuleGrantsToLegacyObjectPermission = ({
  flatObjectPermission,
  flatRowLevelPermissionRules,
}: {
  flatObjectPermission: UniversalFlatObjectPermission;
  flatRowLevelPermissionRules: UniversalFlatRowLevelPermissionRule[];
}): UniversalFlatObjectPermission => {
  const rules = flatRowLevelPermissionRules.filter(
    (rule) =>
      rule.roleUniversalIdentifier ===
        flatObjectPermission.roleUniversalIdentifier &&
      rule.objectMetadataUniversalIdentifier ===
        flatObjectPermission.objectMetadataUniversalIdentifier,
  );

  return {
    ...flatObjectPermission,
    canReadObjectRecords:
      rules.some((rule) => rule.canReadRecords) ||
      flatObjectPermission.canReadObjectRecords,
    canUpdateObjectRecords:
      rules.some((rule) => rule.canUpdateRecords) ||
      flatObjectPermission.canUpdateObjectRecords,
    canSoftDeleteObjectRecords:
      rules.some((rule) => rule.canSoftDeleteRecords) ||
      flatObjectPermission.canSoftDeleteObjectRecords,
    canDestroyObjectRecords:
      rules.some((rule) => rule.canDestroyRecords) ||
      flatObjectPermission.canDestroyObjectRecords,
  };
};
