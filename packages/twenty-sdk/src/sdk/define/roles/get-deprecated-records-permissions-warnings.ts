import { getDeclaredLegacyRoleRecordsPermissionsKeys } from 'twenty-shared/application';

export const getDeprecatedRecordsPermissionsWarnings = ({
  label,
  role,
}: {
  label: string;
  role: Parameters<
    typeof getDeclaredLegacyRoleRecordsPermissionsKeys
  >[0]['role'];
}): string[] => {
  const deprecatedKeys = getDeclaredLegacyRoleRecordsPermissionsKeys({ role });

  return deprecatedKeys.length > 0
    ? [
        `Role "${label}" uses deprecated properties: ${deprecatedKeys.join(', ')}. Declare them in recordsPermissions instead: can…AllRecords for all objects, and per object its can…AllRecords, unreadableFields, uneditableFields and rowLevelRecordsPermissions. They keep working and will be removed in a future version.`,
      ]
    : [];
};
