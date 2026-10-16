import {
  buildApplicationInstallStats,
  type ApplicationVersionStats,
} from 'src/engine/core-modules/application/application-registration/utils/build-application-install-stats.util';

const version = (value: string | null): ApplicationVersionStats => ({
  version: value,
  count: '1',
  suspendedInstalls: '0',
  autoUpdateEnabled: '0',
  needsReconnection: '0',
});

describe('buildApplicationInstallStats', () => {
  it('compares semantic versions and excludes newer and unknown versions from updates', () => {
    expect(
      buildApplicationInstallStats({
        latestAvailableVersion: '2.0.0',
        versions: [
          { ...version('2.0.0'), count: '2', autoUpdateEnabled: '1' },
          version('v2.0.0'),
          version('1.9.0'),
          version('2.0.0-beta.1'),
          version('3.0.0'),
          version(null),
        ],
      }),
    ).toMatchObject({
      activeInstalls: 7,
      onLatestVersion: 3,
      updatesAvailable: 2,
      autoUpdateEnabled: 1,
      mostInstalledVersion: '2.0.0',
    });
  });

  it.each([null, 'invalid'])(
    'keeps update counts unknown for latest version %s',
    (latestAvailableVersion) => {
      expect(
        buildApplicationInstallStats({
          latestAvailableVersion,
          versions: [version('2.0.0')],
        }),
      ).toMatchObject({ onLatestVersion: null, updatesAvailable: null });
    },
  );

  it('orders distribution ties consistently and sums database counts', () => {
    expect(
      buildApplicationInstallStats({
        latestAvailableVersion: '2.0.0',
        versions: [
          {
            ...version('2.0.0'),
            count: '3',
            suspendedInstalls: '1',
            autoUpdateEnabled: '2',
            needsReconnection: '1',
          },
          {
            ...version('1.0.0'),
            count: '3',
            suspendedInstalls: '1',
            autoUpdateEnabled: '1',
            needsReconnection: '2',
          },
        ],
      }),
    ).toMatchObject({
      activeInstalls: 6,
      suspendedInstalls: 2,
      autoUpdateEnabled: 3,
      needsReconnection: 3,
      mostInstalledVersion: '1.0.0',
      versionDistribution: [
        { version: '1.0.0', count: 3 },
        { version: '2.0.0', count: 3 },
      ],
    });
  });

  it('returns zero counts and an empty distribution for no installations', () => {
    expect(
      buildApplicationInstallStats({
        latestAvailableVersion: '2.0.0',
        versions: [],
      }),
    ).toMatchObject({
      activeInstalls: 0,
      onLatestVersion: 0,
      updatesAvailable: 0,
      mostInstalledVersion: null,
      versionDistribution: [],
    });
  });
});
