import semver from 'semver';
import { isDefined } from 'twenty-shared/utils';

export type ApplicationVersionStats = {
  version: string | null;
  count: string;
  suspendedInstalls: string;
  autoUpdateEnabled: string;
  needsReconnection: string;
};

export const buildApplicationInstallStats = ({
  versions,
  latestAvailableVersion,
}: {
  versions: ApplicationVersionStats[];
  latestAvailableVersion: string | null;
}) => {
  const versionDistribution = versions
    .map(({ version, count }) => ({
      version: version ?? 'unknown',
      count: Number(count),
    }))
    .sort(
      (left, right) =>
        right.count - left.count || left.version.localeCompare(right.version),
    );
  const latestVersion = isDefined(latestAvailableVersion)
    ? semver.valid(latestAvailableVersion)
    : null;
  const sum = (
    field:
      | 'count'
      | 'suspendedInstalls'
      | 'autoUpdateEnabled'
      | 'needsReconnection',
  ) => versions.reduce((total, version) => total + Number(version[field]), 0);
  const countVersions = (compare: typeof semver.eq) =>
    isDefined(latestVersion)
      ? versions.reduce(
          (total, { version, count }) =>
            total +
            (isDefined(version) &&
            isDefined(semver.valid(version)) &&
            compare(version, latestVersion)
              ? Number(count)
              : 0),
          0,
        )
      : null;

  return {
    activeInstalls: sum('count'),
    suspendedInstalls: sum('suspendedInstalls'),
    autoUpdateEnabled: sum('autoUpdateEnabled'),
    needsReconnection: sum('needsReconnection'),
    mostInstalledVersion: versionDistribution[0]?.version ?? null,
    versionDistribution,
    onLatestVersion: countVersions(semver.eq),
    updatesAvailable: countVersions(semver.lt),
  };
};
