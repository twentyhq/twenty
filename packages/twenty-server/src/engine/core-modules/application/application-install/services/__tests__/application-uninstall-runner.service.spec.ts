import { Test, type TestingModule } from '@nestjs/testing';

import { ApplicationLookupService } from 'src/engine/core-modules/application/application-lookup/application-lookup.service';
import { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import { ApplicationRegistrationLookupService } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationUninstallRunnerService } from 'src/engine/core-modules/application/application-install/services/application-uninstall-runner.service';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';

const UNIVERSAL_IDENTIFIER = '6f1b5d8e-1d1e-4b1a-9a43-2f4cbbd0e001';
const WORKSPACE_ID = '6f1b5d8e-1d1e-4b1a-9a43-2f4cbbd0e002';

describe('ApplicationUninstallRunnerService', () => {
  let service: ApplicationUninstallRunnerService;

  const uninstallError = new Error('uninstall exploded');

  const metricsService = { incrementCounterBy: jest.fn() };
  const applicationRegistrationLookupService = {
    findOneByUniversalIdentifierGlobal: jest.fn(),
  };
  const eventLogEmitterService = {
    recordApplicationPlatformEvents: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationUninstallRunnerService,
        {
          provide: ApplicationLookupService,
          useValue: {
            findByUniversalIdentifier: jest.fn().mockResolvedValue({
              id: 'application-id',
              name: 'Some app',
              sourceType: 'NPM',
              version: '1.0.0',
              applicationRegistrationId: 'registration-id',
            }),
          },
        },
        {
          provide: ApplicationRegistrationLookupService,
          useValue: applicationRegistrationLookupService,
        },
        {
          provide: ApplicationService,
          useValue: {
            assertUninstallIsNotBlockedByOtherWorkspaceInstallationsOrThrow:
              jest.fn(),
          },
        },
        {
          provide: ApplicationSyncService,
          useValue: {
            uninstallApplication: jest.fn().mockRejectedValue(uninstallError),
          },
        },
        { provide: MetricsService, useValue: metricsService },
        {
          provide: CacheLockService,
          useValue: {
            withLock: jest.fn((callback: () => Promise<unknown>) =>
              callback(),
            ),
          },
        },
        { provide: EventLogEmitterService, useValue: eventLogEmitterService },
      ],
    }).compile();

    service = module.get(ApplicationUninstallRunnerService);
  });

  const uninstall = () =>
    service.uninstallApplication({
      universalIdentifier: UNIVERSAL_IDENTIFIER,
      workspaceId: WORKSPACE_ID,
    });

  const failureMetricCalls = () =>
    metricsService.incrementCounterBy.mock.calls.filter(
      ([{ key }]) => key === MetricsKeys.AppUninstallFailed,
    );

  it('counts the failure for a listed app', async () => {
    applicationRegistrationLookupService.findOneByUniversalIdentifierGlobal.mockResolvedValue(
      { isListed: true },
    );

    await expect(uninstall()).rejects.toBe(uninstallError);

    expect(failureMetricCalls()).toHaveLength(1);
    expect(
      eventLogEmitterService.recordApplicationPlatformEvents,
    ).toHaveBeenCalledTimes(1);
  });

  it('does not count the failure for an unlisted app', async () => {
    applicationRegistrationLookupService.findOneByUniversalIdentifierGlobal.mockResolvedValue(
      { isListed: false },
    );

    await expect(uninstall()).rejects.toBe(uninstallError);

    expect(failureMetricCalls()).toHaveLength(0);
    expect(
      eventLogEmitterService.recordApplicationPlatformEvents,
    ).toHaveBeenCalledTimes(1);
  });

  it('does not count the failure when the registration is missing', async () => {
    applicationRegistrationLookupService.findOneByUniversalIdentifierGlobal.mockResolvedValue(
      null,
    );

    await expect(uninstall()).rejects.toBe(uninstallError);

    expect(failureMetricCalls()).toHaveLength(0);
  });

  it('rethrows the original error when the registration lookup fails', async () => {
    applicationRegistrationLookupService.findOneByUniversalIdentifierGlobal.mockRejectedValue(
      new Error('database down'),
    );

    await expect(uninstall()).rejects.toBe(uninstallError);

    expect(failureMetricCalls()).toHaveLength(0);
    expect(
      eventLogEmitterService.recordApplicationPlatformEvents,
    ).toHaveBeenCalledTimes(1);
  });
});
