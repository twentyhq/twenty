import semver from 'semver';
import { isDefined } from 'twenty-shared/utils';

// Older servers ignore recordsPermissions, which every built role carries
const RECORDS_PERMISSIONS_MINIMUM_SERVER_VERSION = '2.59.0';

const MINIMUM_SERVER_VERSION_RANGE = `>=${RECORDS_PERMISSIONS_MINIMUM_SERVER_VERSION}`;

export const resolveRequiredServerVersionRange = ({
  engineVersionRange,
  hasRoles,
}: {
  engineVersionRange: string | null;
  hasRoles: boolean;
}): { requiredServerVersionRange: string | null; warnings: string[] } => {
  if (!hasRoles) {
    return { requiredServerVersionRange: engineVersionRange, warnings: [] };
  }

  if (!isDefined(engineVersionRange)) {
    return {
      requiredServerVersionRange: MINIMUM_SERVER_VERSION_RANGE,
      warnings: [],
    };
  }

  if (
    !isDefined(semver.validRange(engineVersionRange)) ||
    semver.subset(engineVersionRange, MINIMUM_SERVER_VERSION_RANGE)
  ) {
    return { requiredServerVersionRange: engineVersionRange, warnings: [] };
  }

  return {
    requiredServerVersionRange: engineVersionRange.includes('||')
      ? MINIMUM_SERVER_VERSION_RANGE
      : `${engineVersionRange} ${MINIMUM_SERVER_VERSION_RANGE}`,
    warnings: [
      `engines.twenty "${engineVersionRange}" allows servers older than ${RECORDS_PERMISSIONS_MINIMUM_SERVER_VERSION}, which ignore the recordsPermissions of roles. The app is built to require ${MINIMUM_SERVER_VERSION_RANGE}; raise engines.twenty in package.json to match.`,
    ],
  };
};
