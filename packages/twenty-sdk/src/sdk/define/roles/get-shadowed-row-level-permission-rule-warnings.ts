import {
  getEffectiveObjectPermissionsFromRoleManifest,
  type ObjectRecordsPermissionGrants,
  type RowLevelPermissionRuleManifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

export const getShadowedRowLevelPermissionRuleWarnings = ({
  role,
  rowLevelPermissionRules = [],
}: {
  role: ObjectRecordsPermissionGrants;
  rowLevelPermissionRules?: Pick<
    RowLevelPermissionRuleManifest,
    | 'universalIdentifier'
    | 'objectUniversalIdentifier'
    | 'canReadRecords'
    | 'canUpdateRecords'
    | 'canSoftDeleteRecords'
    | 'canDestroyRecords'
  >[];
}): string[] =>
  rowLevelPermissionRules.flatMap((rule) => {
    const allRecordsPermissions = getEffectiveObjectPermissionsFromRoleManifest(
      { role, objectUniversalIdentifier: rule.objectUniversalIdentifier },
    );
    const shadowedOperations = [
      rule.canReadRecords && allRecordsPermissions.canReadObjectRecords
        ? 'read'
        : undefined,
      rule.canUpdateRecords && allRecordsPermissions.canUpdateObjectRecords
        ? 'update'
        : undefined,
      rule.canSoftDeleteRecords &&
      allRecordsPermissions.canSoftDeleteObjectRecords
        ? 'soft delete'
        : undefined,
      rule.canDestroyRecords && allRecordsPermissions.canDestroyObjectRecords
        ? 'destroy'
        : undefined,
    ].filter(isDefined);

    return shadowedOperations.length > 0
      ? [
          `Row level permission rule "${rule.universalIdentifier}" is ignored for ${shadowedOperations.join(', ')}: the role already grants it on all records of the object. Remove that grant from objectPermissions or from the role so the rule applies.`,
        ]
      : [];
  });
