import { ApplicationUninstallRunnerService } from 'src/engine/core-modules/application/application-install/services/application-uninstall-runner.service';
import type { ApplicationLookupService } from 'src/engine/core-modules/application/application-lookup/application-lookup.service';
import type { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import type { ApplicationService } from 'src/engine/core-modules/application/application.service';
import type { WellKnownOAuthClientInstallService } from 'src/engine/core-modules/application/well-known-oauth-client/services/well-known-oauth-client-install.service';
import type { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import type { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import type { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';

const WORKSPACE_ID = 'workspace-id';
const TARGET_UNIVERSAL_IDENTIFIER = 'shared-claude';
const LEGACY_UNIVERSAL_IDENTIFIER = 'legacy-claude-1';
const OTHER_LEGACY_UNIVERSAL_IDENTIFIER = 'legacy-claude-2';

describe('ApplicationUninstallRunnerService', () => {
  let installedUniversalIdentifiers: Set<string>;
  let uninstalledUniversalIdentifiers: string[];

  const applicationLookupService = {
    findByUniversalIdentifier: jest.fn(
      async ({ universalIdentifier }: { universalIdentifier: string }) =>
        installedUniversalIdentifiers.has(universalIdentifier)
          ? { id: `${universalIdentifier}-id`, universalIdentifier }
          : null,
    ),
  } as unknown as ApplicationLookupService;

  const applicationService = {
    assertUninstallIsNotBlockedByOtherWorkspaceInstallationsOrThrow: jest.fn(),
  } as unknown as ApplicationService;

  const applicationSyncService = {
    uninstallApplication: jest.fn(
      async ({
        applicationUniversalIdentifier,
      }: {
        applicationUniversalIdentifier: string;
      }) => {
        if (
          !installedUniversalIdentifiers.has(applicationUniversalIdentifier)
        ) {
          throw new ApplicationException(
            `Application ${applicationUniversalIdentifier} not found`,
            ApplicationExceptionCode.APPLICATION_NOT_FOUND,
          );
        }

        installedUniversalIdentifiers.delete(applicationUniversalIdentifier);
        uninstalledUniversalIdentifiers.push(applicationUniversalIdentifier);
      },
    ),
  } as unknown as ApplicationSyncService;

  const metricsService = {
    incrementCounterBy: jest.fn(),
  } as unknown as MetricsService;

  const cacheLockService = {
    withLock: jest.fn((callback: () => Promise<unknown>) => callback()),
  } as unknown as CacheLockService;

  const eventLogEmitterService = {
    recordApplicationPlatformEvents: jest.fn(),
  } as unknown as EventLogEmitterService;

  const wellKnownOAuthClientInstallService = {
    findOtherInstallUniversalIdentifiers: jest.fn(),
  } as unknown as WellKnownOAuthClientInstallService;

  const service = new ApplicationUninstallRunnerService(
    applicationLookupService,
    applicationService,
    applicationSyncService,
    metricsService,
    cacheLockService,
    eventLogEmitterService,
    wellKnownOAuthClientInstallService,
  );

  const uninstallTarget = () =>
    service.uninstallApplication({
      universalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
      workspaceId: WORKSPACE_ID,
    });

  const mockOtherInstallUniversalIdentifiers = (
    universalIdentifiers: string[],
  ) =>
    jest
      .spyOn(
        wellKnownOAuthClientInstallService,
        'findOtherInstallUniversalIdentifiers',
      )
      .mockResolvedValue(universalIdentifiers);

  const findMetricUniversalIdentifiers = (key: MetricsKeys) =>
    jest
      .mocked(metricsService.incrementCounterBy)
      .mock.calls.filter(([metric]) => metric.key === key)
      .map(([metric]) => metric.attributes?.universal_identifier);

  beforeEach(() => {
    jest.clearAllMocks();
    installedUniversalIdentifiers = new Set([
      TARGET_UNIVERSAL_IDENTIFIER,
      LEGACY_UNIVERSAL_IDENTIFIER,
      OTHER_LEGACY_UNIVERSAL_IDENTIFIER,
    ]);
    uninstalledUniversalIdentifiers = [];
  });

  it('uninstalls the other installs of a well-known client first, then the target', async () => {
    mockOtherInstallUniversalIdentifiers([
      LEGACY_UNIVERSAL_IDENTIFIER,
      OTHER_LEGACY_UNIVERSAL_IDENTIFIER,
    ]);

    await uninstallTarget();

    expect(uninstalledUniversalIdentifiers).toEqual([
      LEGACY_UNIVERSAL_IDENTIFIER,
      OTHER_LEGACY_UNIVERSAL_IDENTIFIER,
      TARGET_UNIVERSAL_IDENTIFIER,
    ]);
    expect(
      wellKnownOAuthClientInstallService.findOtherInstallUniversalIdentifiers,
    ).toHaveBeenCalledTimes(1);
    expect(
      findMetricUniversalIdentifiers(MetricsKeys.AppUninstallSucceeded),
    ).toEqual(uninstalledUniversalIdentifiers);
    expect(
      eventLogEmitterService.recordApplicationPlatformEvents,
    ).toHaveBeenCalledTimes(3);
  });

  it('only uninstalls the target when it is not a well-known client', async () => {
    mockOtherInstallUniversalIdentifiers([]);

    await uninstallTarget();

    expect(uninstalledUniversalIdentifiers).toEqual([
      TARGET_UNIVERSAL_IDENTIFIER,
    ]);
  });

  it('skips an other install a concurrent run already uninstalled', async () => {
    mockOtherInstallUniversalIdentifiers([
      LEGACY_UNIVERSAL_IDENTIFIER,
      OTHER_LEGACY_UNIVERSAL_IDENTIFIER,
    ]);
    installedUniversalIdentifiers.delete(LEGACY_UNIVERSAL_IDENTIFIER);

    await uninstallTarget();

    expect(uninstalledUniversalIdentifiers).toEqual([
      OTHER_LEGACY_UNIVERSAL_IDENTIFIER,
      TARGET_UNIVERSAL_IDENTIFIER,
    ]);
    expect(
      findMetricUniversalIdentifiers(MetricsKeys.AppUninstallFailed),
    ).toEqual([]);
  });

  it('skips an other install a concurrent run uninstalled while this run waited for its lock', async () => {
    mockOtherInstallUniversalIdentifiers([LEGACY_UNIVERSAL_IDENTIFIER]);
    jest
      .spyOn(cacheLockService, 'withLock')
      .mockImplementationOnce(async (callback) => {
        installedUniversalIdentifiers.delete(LEGACY_UNIVERSAL_IDENTIFIER);

        return callback();
      });

    await uninstallTarget();

    expect(uninstalledUniversalIdentifiers).toEqual([
      TARGET_UNIVERSAL_IDENTIFIER,
    ]);
    expect(
      findMetricUniversalIdentifiers(MetricsKeys.AppUninstallFailed),
    ).toEqual([]);
  });

  it('leaves the target installed when an other install fails to uninstall', async () => {
    mockOtherInstallUniversalIdentifiers([LEGACY_UNIVERSAL_IDENTIFIER]);
    const error = new Error('Uninstallation failed');

    jest
      .spyOn(applicationSyncService, 'uninstallApplication')
      .mockRejectedValueOnce(error);

    await expect(uninstallTarget()).rejects.toThrow(error);

    expect(installedUniversalIdentifiers).toContain(
      TARGET_UNIVERSAL_IDENTIFIER,
    );
    expect(
      findMetricUniversalIdentifiers(MetricsKeys.AppUninstallFailed),
    ).toEqual([LEGACY_UNIVERSAL_IDENTIFIER]);
  });

  it('still fails when the target itself is not installed', async () => {
    mockOtherInstallUniversalIdentifiers([]);
    installedUniversalIdentifiers.delete(TARGET_UNIVERSAL_IDENTIFIER);

    await expect(uninstallTarget()).rejects.toMatchObject({
      code: ApplicationExceptionCode.APPLICATION_NOT_FOUND,
    });
  });
});
