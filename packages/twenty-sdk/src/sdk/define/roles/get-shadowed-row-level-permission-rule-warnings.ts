import { isDefined } from 'twenty-shared/utils';

type AllRecordsGrants = {
  canReadAllRecords?: boolean;
  canUpdateAllRecords?: boolean;
  canSoftDeleteAllRecords?: boolean;
  canDestroyAllRecords?: boolean;
};

type ObjectRecordsPermissions = AllRecordsGrants & {
  rowLevelRecordsPermissions?: {
    universalIdentifier: string;
    canReadRecords?: boolean;
    canUpdateRecords?: boolean;
    canSoftDeleteRecords?: boolean;
    canDestroyRecords?: boolean;
  }[];
};

export const getShadowedRowLevelPermissionRuleWarnings = ({
  recordsPermissions: { objects = [], ...allObjectsGrants } = {},
}: {
  recordsPermissions?: AllRecordsGrants & {
    objects?: ObjectRecordsPermissions[];
  };
}): string[] =>
  objects.flatMap(({ rowLevelRecordsPermissions = [], ...objectGrants }) =>
    rowLevelRecordsPermissions.flatMap((rule) => {
      const shadowedOperations = [
        rule.canReadRecords &&
        (objectGrants.canReadAllRecords ?? allObjectsGrants.canReadAllRecords)
          ? 'read'
          : undefined,
        rule.canUpdateRecords &&
        (objectGrants.canUpdateAllRecords ??
          allObjectsGrants.canUpdateAllRecords)
          ? 'update'
          : undefined,
        rule.canSoftDeleteRecords &&
        (objectGrants.canSoftDeleteAllRecords ??
          allObjectsGrants.canSoftDeleteAllRecords)
          ? 'soft delete'
          : undefined,
        rule.canDestroyRecords &&
        (objectGrants.canDestroyAllRecords ??
          allObjectsGrants.canDestroyAllRecords)
          ? 'destroy'
          : undefined,
      ].filter(isDefined);

      return shadowedOperations.length > 0
        ? [
            `Row level permission rule "${rule.universalIdentifier}" is ignored for ${shadowedOperations.join(', ')}: the role already grants it on all records. Set the matching can…AllRecords to false on the object so the rule applies.`,
          ]
        : [];
    }),
  );
