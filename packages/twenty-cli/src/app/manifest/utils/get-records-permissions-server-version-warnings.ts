import semver from 'semver';
import { type LegacyCompliantRoleManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

// Older servers accept the manifest and silently drop recordsPermissions, leaving the role without record access
const RECORDS_PERMISSIONS_MINIMUM_SERVER_VERSION = '2.59.0';

const isServerVersionRangeAtLeastMinimum = (
  requiredServerVersionRange: string | null,
): boolean => {
  if (
    !isDefined(requiredServerVersionRange) ||
    !isDefined(semver.validRange(requiredServerVersionRange))
  ) {
    return false;
  }

  const lowestAllowedVersion = semver.minVersion(requiredServerVersionRange);

  return (
    isDefined(lowestAllowedVersion) &&
    semver.gte(lowestAllowedVersion, RECORDS_PERMISSIONS_MINIMUM_SERVER_VERSION)
  );
};

export const getRecordsPermissionsServerVersionWarnings = ({
  roles,
  requiredServerVersionRange,
}: {
  roles: Pick<LegacyCompliantRoleManifest, 'label' | 'recordsPermissions'>[];
  requiredServerVersionRange: string | null;
}): string[] => {
  const roleLabels = roles
    .filter((role) => isDefined(role.recordsPermissions))
    .map((role) => `"${role.label}"`);

  if (
    roleLabels.length === 0 ||
    isServerVersionRangeAtLeastMinimum(requiredServerVersionRange)
  ) {
    return [];
  }

  return [
    `recordsPermissions (declared by ${roleLabels.join(', ')}) is ignored by servers older than Twenty ${RECORDS_PERMISSIONS_MINIMUM_SERVER_VERSION}: the app would sync there with no record access. Set "engines.twenty" to ">=${RECORDS_PERMISSIONS_MINIMUM_SERVER_VERSION}" in package.json so those servers refuse it (currently ${requiredServerVersionRange ?? 'not set'}).`,
  ];
};
