import { CONTAINER_NAME } from '@/cli/utilities/server/docker-container';
import { compareSemver } from '@/cli/utilities/version/compare-semver';
import { getLocalServerVersion } from '@/cli/utilities/version/get-local-server-version';
import { getPublishedServerVersions } from '@/cli/utilities/version/get-published-server-versions';
import { parseSemver } from '@/cli/utilities/version/parse-semver';
import { type VersionInfo } from '@/cli/utilities/version/version-info';
import sdkPackageJson from '../../../../package.json';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Fallback for versions older than the most recent ~100 Docker Hub tags:
// they can't be matched by name, so we report a sentinel age that always
// exceeds any reasonable staleness threshold.
const UNKNOWN_AGE_DAYS_BEHIND = 365;

export const getVersionInfo = async (
  containerName: string = CONTAINER_NAME,
): Promise<VersionInfo> => {
  const cliVersion = sdkPackageJson.version;
  const [localServerVersion, publishedVersions] = await Promise.all([
    getLocalServerVersion(containerName),
    getPublishedServerVersions(),
  ]);
  const latestServerVersion = publishedVersions[0]?.name ?? null;

  const localParsed = localServerVersion
    ? parseSemver(localServerVersion)
    : null;
  const latestParsed = latestServerVersion
    ? parseSemver(latestServerVersion)
    : null;

  const isMinorOrMajorBehind =
    localParsed !== null &&
    latestParsed !== null &&
    (localParsed[0] < latestParsed[0] ||
      (localParsed[0] === latestParsed[0] && localParsed[1] < latestParsed[1]));

  const localPublishedAt =
    localParsed === null
      ? undefined
      : publishedVersions.find((entry) => {
          const entryParsed = parseSemver(entry.name);

          return (
            entryParsed !== null &&
            compareSemver(entryParsed, localParsed) === 0
          );
        })?.lastUpdatedAt;

  const latestPublishedAt = publishedVersions[0]?.lastUpdatedAt;

  let daysBehind: number | null = null;

  if (latestPublishedAt && localPublishedAt) {
    daysBehind = Math.floor(
      (latestPublishedAt.getTime() - localPublishedAt.getTime()) / MS_PER_DAY,
    );
  } else if (latestPublishedAt && isMinorOrMajorBehind) {
    daysBehind = UNKNOWN_AGE_DAYS_BEHIND;
  }

  return {
    cliVersion,
    localServerVersion,
    latestServerVersion,
    isMinorOrMajorBehind,
    daysBehind,
  };
};
