import {
  type ObjectRecordsPermissionsManifest,
  type RowLevelPermissionRuleManifest,
} from 'twenty-shared/application';
import { isNonEmptyArray } from 'twenty-shared/utils';

type AllRecordsPermissionsManifest = Omit<
  ObjectRecordsPermissionsManifest,
  'rowLevelRecordsPermissions'
>;

export const buildObjectRecordsPermissionsManifests = ({
  allRecordsPermissions,
  rowLevelPermissionRules,
}: {
  allRecordsPermissions: AllRecordsPermissionsManifest[];
  rowLevelPermissionRules: RowLevelPermissionRuleManifest[];
}): ObjectRecordsPermissionsManifest[] => {
  const objectUniversalIdentifiersWithAllRecordsPermissions = new Set(
    allRecordsPermissions.map(
      ({ objectUniversalIdentifier }) => objectUniversalIdentifier,
    ),
  );
  const objectUniversalIdentifiersWithOnlyRules = [
    ...new Set(
      rowLevelPermissionRules
        .map(({ objectUniversalIdentifier }) => objectUniversalIdentifier)
        .filter(
          (objectUniversalIdentifier) =>
            !objectUniversalIdentifiersWithAllRecordsPermissions.has(
              objectUniversalIdentifier,
            ),
        ),
    ),
  ];

  return [
    ...allRecordsPermissions,
    ...objectUniversalIdentifiersWithOnlyRules.map(
      (objectUniversalIdentifier): AllRecordsPermissionsManifest => ({
        objectUniversalIdentifier,
      }),
    ),
  ].map((objectRecordsPermissions) => {
    const rowLevelRecordsPermissions = rowLevelPermissionRules
      .filter(
        ({ objectUniversalIdentifier }) =>
          objectUniversalIdentifier ===
          objectRecordsPermissions.objectUniversalIdentifier,
      )
      .map(
        ({ objectUniversalIdentifier: _objectUniversalIdentifier, ...rule }) =>
          rule,
      );

    return isNonEmptyArray(rowLevelRecordsPermissions)
      ? { ...objectRecordsPermissions, rowLevelRecordsPermissions }
      : objectRecordsPermissions;
  });
};
