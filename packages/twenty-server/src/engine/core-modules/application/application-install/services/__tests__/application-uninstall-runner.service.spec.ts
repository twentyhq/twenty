import type { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import type { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationUninstallRunnerService } from 'src/engine/core-modules/application/application-install/services/application-uninstall-runner.service';
import type { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import type { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';

describe('ApplicationUninstallRunnerService', () => {
  const applicationService = {
    findByUniversalIdentifier: jest.fn().mockResolvedValue({
      name: 'Slack',
      sourceType: 'NPM',
      version: '1.2.0',
    }),
  } as unknown as ApplicationService;
  const applicationSyncService = {
    uninstallApplication: jest.fn(),
  } as unknown as ApplicationSyncService;
  const metricsService = {
    incrementCounterBy: jest.fn(),
  } as unknown as MetricsService;
  const cacheLockService = {
    withLock: jest.fn((fn: () => Promise<unknown>) => fn()),
  } as unknown as CacheLockService;

  const service = new ApplicationUninstallRunnerService(
    applicationService,
    applicationSyncService,
    metricsService,
    cacheLockService,
  );

  const target = {
    universalIdentifier: 'application-universal-identifier',
    workspaceId: 'workspace-id',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uninstalls the application under the lifecycle lock and counts the success', async () => {
    await service.uninstallApplication(target);

    expect(cacheLockService.withLock).toHaveBeenCalledWith(
      expect.any(Function),
      `app-install:${target.workspaceId}:${target.universalIdentifier}`,
      { ttl: 60_000, ms: 500, maxRetries: 120 },
    );
    expect(applicationSyncService.uninstallApplication).toHaveBeenCalledWith({
      applicationUniversalIdentifier: target.universalIdentifier,
      workspaceId: target.workspaceId,
    });
    expect(metricsService.incrementCounterBy).toHaveBeenCalledWith({
      key: MetricsKeys.AppUninstallSucceeded,
      amount: 1,
      attributes: {
        universal_identifier: target.universalIdentifier,
        app_name: 'Slack',
        source_type: 'NPM',
        version: '1.2.0',
      },
    });
  });

  it('counts the failure with its code and rethrows', async () => {
    const error = new ApplicationException(
      'This application cannot be uninstalled.',
      ApplicationExceptionCode.FORBIDDEN,
    );

    jest
      .spyOn(applicationSyncService, 'uninstallApplication')
      .mockRejectedValueOnce(error);

    await expect(service.uninstallApplication(target)).rejects.toBe(error);
    expect(metricsService.incrementCounterBy).toHaveBeenCalledWith(
      expect.objectContaining({
        key: MetricsKeys.AppUninstallFailed,
        attributes: expect.objectContaining({
          error_code: ApplicationExceptionCode.FORBIDDEN,
        }),
      }),
    );
  });
});
