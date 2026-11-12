import {
  DEPRECATED_ROLE_RECORDS_PERMISSIONS_MANIFEST_KEYS,
  type DeprecatedRoleRecordsPermissionsManifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

export const getDeprecatedRecordsPermissionsWarnings = ({
  label,
  role,
}: {
  label: string;
  role: {
    [Key in keyof DeprecatedRoleRecordsPermissionsManifest]?:
      | boolean
      | unknown[];
  };
}): string[] => {
  const deprecatedKeys =
    DEPRECATED_ROLE_RECORDS_PERMISSIONS_MANIFEST_KEYS.filter(
      (deprecatedKey) => {
        const value = role[deprecatedKey];

        return Array.isArray(value) ? value.length > 0 : isDefined(value);
      },
    );

  return deprecatedKeys.length > 0
    ? [
        `Role "${label}" uses deprecated properties: ${deprecatedKeys.join(', ')}. Declare them in recordsPermissions instead: can…AllRecords for all objects, and per object its can…AllRecords, unreadableFields, uneditableFields and rowLevelRecordsPermissions. They are converted when the app is built and will be removed in a future version.`,
      ]
    : [];
};
