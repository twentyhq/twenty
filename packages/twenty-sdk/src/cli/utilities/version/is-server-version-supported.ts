import semver from 'semver';
import { isDefined } from 'twenty-shared/utils';

export const isServerVersionSupported = ({
  serverVersion,
  supportedServerVersionRange,
}: {
  serverVersion: string | null;
  supportedServerVersionRange: string;
}): boolean => {
  // A server that cannot resolve its own version gives nothing reliable to
  // compare against, so it is not blocked.
  if (!isDefined(serverVersion) || !isDefined(semver.valid(serverVersion))) {
    return true;
  }

  return semver.satisfies(serverVersion, supportedServerVersionRange);
};
