import { ConfigService } from '@/cli/utilities/config/config-service';
import {
  CONTAINER_NAME,
  getContainerPort,
  isContainerRunning,
} from '@/cli/utilities/server/docker-container';
import { compareSemver } from '@/cli/utilities/version/compare-semver';
import { getLocalServerVersion } from '@/cli/utilities/version/get-local-server-version';
import { getPublishedServerVersions } from '@/cli/utilities/version/get-published-server-versions';
import { getServerVersionFromApi } from '@/cli/utilities/version/get-server-version-from-api';
import { parseSemver } from '@/cli/utilities/version/parse-semver';
import { type VersionInfo } from '@/cli/utilities/version/version-info';
import sdkPackageJson from '../../../../package.json';

const LOCAL_REMOTE_NAME = 'local';

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '0.0.0.0']);

const isLoopbackHost = (hostname: string): boolean =>
  LOOPBACK_HOSTS.has(hostname);

const isContainerServingApiUrl = async (
  containerName: string,
): Promise<boolean> => {
  if (ConfigService.getActiveRemote() !== LOCAL_REMOTE_NAME) {
    return false;
  }

  if (!isContainerRunning(containerName)) {
    return false;
  }

  try {
    const { apiUrl } = await new ConfigService().getConfig();
    const { hostname, port: apiPort } = new URL(apiUrl);

    return (
      isLoopbackHost(hostname) &&
      apiPort !== '' &&
      String(getContainerPort(containerName)) === apiPort
    );
  } catch {
    return false;
  }
};

const resolveLocalServerVersion = async (
  containerName: string,
): Promise<string | null> => {
  if (await isContainerServingApiUrl(containerName)) {
    const dockerVersion = await getLocalServerVersion(containerName);

    if (dockerVersion !== null) {
      return dockerVersion;
    }
  }

  return (
    (await getServerVersionFromApi()) ??
    (await getLocalServerVersion(containerName))
  );
};

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
    resolveLocalServerVersion(containerName),
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
