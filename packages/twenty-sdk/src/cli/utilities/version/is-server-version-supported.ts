import semver from 'semver';
import { isDefined } from 'twenty-shared/utils';

export const isServerVersionSupported = ({
  serverVersion,
  supportedServerVersionRange,
}: {
  serverVersion: string | null;
  supportedServerVersionRange: string;
}): boolean => {
  if (!isDefined(serverVersion) || !isDefined(semver.valid(serverVersion))) {
    return true;
  }

  return semver.satisfies(serverVersion, supportedServerVersionRange);
};
