import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { ApplicationLookupService } from 'src/engine/core-modules/application/application-lookup/application-lookup.service';
import { ApplicationManifestApplyService } from 'src/engine/core-modules/application/application-manifest/application-manifest-apply.service';
import { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import { ApplicationPackageFetcherService } from 'src/engine/core-modules/application/application-package/application-package-fetcher.service';
import { ApplicationVersionValidationService } from 'src/engine/core-modules/application/application-package/application-version-validation.service';
import { ApplicationRegistrationVersionService } from 'src/engine/core-modules/application/application-registration-version/application-registration-version.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = '6f1b5d8e-1d1e-4b1a-9a43-2f4cbbd0e002';

describe('ApplicationInstallService failure metrics', () => {
  let service: ApplicationInstallService;

  const metricsService = { incrementCounterBy: jest.fn() };
  const appRegistrationRepository = { findOne: jest.fn() };
  const applicationLookupService = { findByUniversalIdentifier: jest.fn() };
  const eventLogEmitterService = {
    recordApplicationPlatformEvents: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationInstallService,
        {
          provide: getRepositoryToken(ApplicationRegistrationEntity),
          useValue: appRegistrationRepository,
        },
        { provide: ApplicationService, useValue: {} },
        {
          provide: ApplicationLookupService,
          useValue: applicationLookupService,
        },
        {
          provide: ApplicationPackageFetcherService,
          useValue: {
            resolvePackage: jest.fn().mockResolvedValue({
              extractedDir: '/tmp/extracted',
              cleanupDir: '/tmp/cleanup',
              manifest: { application: { displayName: 'Some app' } },
              packageJson: { version: '2.0.0', engines: { twenty: '>=99' } },
            }),
            cleanupExtractedDir: jest.fn(),
          },
        },
        {
          // Fails the install at its first step so the test stays on the
          // metrics path without wiring the full sync pipeline.
          provide: ApplicationVersionValidationService,
          useValue: {
            validateWorkspaceCompatibility: jest.fn().mockResolvedValue({
              compatible: false,
              reason: 'WORKSPACE_INCOMPATIBLE',
              message: 'Workspace is too old',
            }),
          },
        },
        { provide: ApplicationRegistrationVersionService, useValue: {} },
        { provide: ApplicationSyncService, useValue: {} },
        { provide: ApplicationManifestApplyService, useValue: {} },
        { provide: FileStorageService, useValue: {} },
        { provide: LogicFunctionExecutorService, useValue: {} },
        {
          provide: CacheLockService,
          useValue: {
            withLock: jest.fn((callback: () => Promise<unknown>) => callback()),
          },
        },
        {
          provide: getQueueToken(MessageQueue.applicationLifecycleHookQueue),
          useValue: {},
        },
        {
          provide: getQueueToken(MessageQueue.lambdaManagementQueue),
          useValue: {},
        },
        { provide: WorkspaceCacheService, useValue: {} },
        { provide: MetricsService, useValue: metricsService },
        { provide: EventLogEmitterService, useValue: eventLogEmitterService },
      ],
    }).compile();

    service = module.get(ApplicationInstallService);
  });

  const givenRegistration = ({ isListed }: { isListed: boolean }) =>
    appRegistrationRepository.findOne.mockResolvedValue({
      id: 'registration-id',
      universalIdentifier: '6f1b5d8e-1d1e-4b1a-9a43-2f4cbbd0e001',
      sourceType: ApplicationRegistrationSourceType.NPM,
      isListed,
      manifest: null,
    });

  const install = () =>
    service.installApplication({
      appRegistrationId: 'registration-id',
      workspaceId: WORKSPACE_ID,
    });

  const countedKeys = () =>
    metricsService.incrementCounterBy.mock.calls.map(([{ key }]) => key);

  describe.each([
    {
      operation: 'install',
      existingApplication: null,
      failedKey: MetricsKeys.AppInstallFailed,
    },
    {
      operation: 'upgrade',
      existingApplication: { id: 'application-id', version: '1.0.0' },
      failedKey: MetricsKeys.AppUpgradeFailed,
    },
  ])('$operation', ({ existingApplication, failedKey }) => {
    beforeEach(() => {
      applicationLookupService.findByUniversalIdentifier.mockResolvedValue(
        existingApplication,
      );
    });

    it('counts the failure for a listed app', async () => {
      givenRegistration({ isListed: true });

      await expect(install()).rejects.toThrow('Workspace is too old');

      expect(countedKeys()).toEqual([failedKey]);
      expect(
        eventLogEmitterService.recordApplicationPlatformEvents,
      ).toHaveBeenCalledTimes(1);
    });

    it('does not count the failure for an unlisted app', async () => {
      givenRegistration({ isListed: false });

      await expect(install()).rejects.toThrow('Workspace is too old');

      expect(countedKeys()).toEqual([]);
      expect(
        eventLogEmitterService.recordApplicationPlatformEvents,
      ).toHaveBeenCalledTimes(1);
    });
  });
});
