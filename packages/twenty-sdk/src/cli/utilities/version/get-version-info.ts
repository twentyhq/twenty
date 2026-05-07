import { CONTAINER_NAME } from '@/cli/utilities/server/docker-container';
import { getLocalServerVersion } from '@/cli/utilities/version/get-local-server-version';
import { getPublishedServerVersions } from '@/cli/utilities/version/get-published-server-versions';
import { parseSemver } from '@/cli/utilities/version/parse-semver';
import { type VersionInfo } from '@/cli/utilities/version/version-info';
import sdkPackageJson from '../../../../package.json';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const getVersionInfo = async (
  containerName: string = CONTAINER_NAME,
): Promise<VersionInfo> => {
  const cliVersion = sdkPackageJson.version;
  const localServerVersion = getLocalServerVersion(containerName);
  const publishedVersions = await getPublishedServerVersions();
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

  const localPublishedAt = publishedVersions.find(
    ({ name }) => name === localServerVersion,
  )?.lastUpdatedAt;
  const latestPublishedAt = publishedVersions[0]?.lastUpdatedAt;

  const daysBehind =
    localPublishedAt && latestPublishedAt
      ? Math.floor(
          (latestPublishedAt.getTime() - localPublishedAt.getTime()) /
            MS_PER_DAY,
        )
      : null;

  return {
    cliVersion,
    localServerVersion,
    latestServerVersion,
    isMinorOrMajorBehind,
    daysBehind,
  };
};
