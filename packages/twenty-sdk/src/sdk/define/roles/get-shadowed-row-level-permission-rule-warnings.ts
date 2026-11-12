import { isDefined } from 'twenty-shared/utils';

type RoleAllRecordsGrants = {
  canReadAllObjectRecords?: boolean;
  canUpdateAllObjectRecords?: boolean;
  canSoftDeleteAllObjectRecords?: boolean;
  canDestroyAllObjectRecords?: boolean;
};

type ObjectRecordsPermissions = {
  canReadAllRecords?: boolean;
  canUpdateAllRecords?: boolean;
  canSoftDeleteAllRecords?: boolean;
  canDestroyAllRecords?: boolean;
  rowLevelRecordsPermissions?: {
    universalIdentifier: string;
    canReadRecords?: boolean;
    canUpdateRecords?: boolean;
    canSoftDeleteRecords?: boolean;
    canDestroyRecords?: boolean;
  }[];
};

export const getShadowedRowLevelPermissionRuleWarnings = ({
  role,
  objectRecordsPermissions = [],
}: {
  role: RoleAllRecordsGrants;
  objectRecordsPermissions?: ObjectRecordsPermissions[];
}): string[] =>
  objectRecordsPermissions.flatMap(
    ({ rowLevelRecordsPermissions = [], ...allRecordsGrants }) =>
      rowLevelRecordsPermissions.flatMap((rule) => {
        const shadowedOperations = [
          rule.canReadRecords &&
          (allRecordsGrants.canReadAllRecords ?? role.canReadAllObjectRecords)
            ? 'read'
            : undefined,
          rule.canUpdateRecords &&
          (allRecordsGrants.canUpdateAllRecords ??
            role.canUpdateAllObjectRecords)
            ? 'update'
            : undefined,
          rule.canSoftDeleteRecords &&
          (allRecordsGrants.canSoftDeleteAllRecords ??
            role.canSoftDeleteAllObjectRecords)
            ? 'soft delete'
            : undefined,
          rule.canDestroyRecords &&
          (allRecordsGrants.canDestroyAllRecords ??
            role.canDestroyAllObjectRecords)
            ? 'destroy'
            : undefined,
        ].filter(isDefined);

        return shadowedOperations.length > 0
          ? [
              `Row level records permissions "${rule.universalIdentifier}" are ignored for ${shadowedOperations.join(', ')}: the role already grants it on all records of the object. Set the matching can…AllRecords to false on the object so the rule applies.`,
            ]
          : [];
      }),
  );
