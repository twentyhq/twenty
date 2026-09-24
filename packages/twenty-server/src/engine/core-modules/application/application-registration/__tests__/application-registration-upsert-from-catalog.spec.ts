import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Manifest } from 'twenty-shared/application';

import { ApplicationRegistrationAssetUrlService } from 'src/engine/core-modules/application/application-registration/application-registration-asset-url.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.service';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { ServerFileStorageService } from 'src/engine/core-modules/file-storage/services/server-file-storage.service';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';

describe('ApplicationRegistrationService - upsertFromCatalog', () => {
  let service: ApplicationRegistrationService;
  let applicationRegistrationRepository: {
    findOne: jest.Mock;
    save: jest.Mock;
    create: jest.Mock;
  };

  const catalogParams = {
    universalIdentifier: '97141c95-2870-5662-8992-44fb6536be9a',
    name: 'My App',
    sourceType: ApplicationRegistrationSourceType.NPM,
    sourcePackage: 'twenty-app-my-app',
    latestAvailableVersion: '0.2.0',
    manifest: {
      application: {
        universalIdentifier: '97141c95-2870-5662-8992-44fb6536be9a',
      },
    } as unknown as Manifest,
  };

  const buildExistingRegistration = (
    overrides: Partial<ApplicationRegistrationEntity>,
  ) =>
    ({
      id: 'registration-id',
      universalIdentifier: catalogParams.universalIdentifier,
      name: 'My App',
      galleryImages: [],
      ...overrides,
    }) as ApplicationRegistrationEntity;

  beforeEach(async () => {
    applicationRegistrationRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn((entity) => entity),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationRegistrationService,
        {
          provide: getRepositoryToken(ApplicationRegistrationEntity),
          useValue: applicationRegistrationRepository,
        },
        {
          provide: getRepositoryToken(ApplicationEntity),
          useValue: { find: jest.fn(), findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: { find: jest.fn(), findOne: jest.fn() },
        },
        {
          provide: ApplicationRegistrationVariableService,
          useValue: { syncVariableSchemas: jest.fn() },
        },
        {
          provide: ApplicationRegistrationAssetUrlService,
          useValue: { resolveAssetUrls: jest.fn() },
        },
        {
          provide: ServerFileStorageService,
          useValue: { write: jest.fn(), delete: jest.fn() },
        },
        {
          provide: CacheLockService,
          useValue: { withLock: jest.fn((_key, fn) => fn()) },
        },
        {
          provide: CoreEntityCacheService,
          useValue: { invalidate: jest.fn() },
        },
        {
          provide: MetricsService,
          useValue: { incrementCounterBy: jest.fn() },
        },
        {
          provide: getQueueToken(MessageQueue.applicationUpgradeQueue),
          useValue: { add: jest.fn() },
        },
        {
          provide: WorkspaceEventBroadcaster,
          useValue: { broadcast: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ApplicationRegistrationService>(
      ApplicationRegistrationService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    ApplicationRegistrationSourceType.LOCAL,
    ApplicationRegistrationSourceType.TARBALL,
    ApplicationRegistrationSourceType.OAUTH_ONLY,
  ])(
    'should not attach the catalog to a registration created from source %s',
    async (sourceType) => {
      const existingRegistration = buildExistingRegistration({
        sourceType,
        isListed: false,
      });

      applicationRegistrationRepository.findOne.mockResolvedValue(
        existingRegistration,
      );

      const updateFromManifestSpy = jest
        .spyOn(service, 'updateFromManifest')
        .mockResolvedValue({
          registration: existingRegistration,
          isNewerVersion: false,
        });

      await service.upsertFromCatalog(catalogParams);

      expect(applicationRegistrationRepository.save).not.toHaveBeenCalled();
      expect(updateFromManifestSpy).not.toHaveBeenCalled();
    },
  );

  it('should leave the operator listing and vetting choices untouched on update', async () => {
    const existingRegistration = buildExistingRegistration({
      sourceType: ApplicationRegistrationSourceType.NPM,
      isListed: false,
    });

    applicationRegistrationRepository.findOne.mockResolvedValue(
      existingRegistration,
    );
    const updateFromManifestSpy = jest
      .spyOn(service, 'updateFromManifest')
      .mockResolvedValue({
        registration: existingRegistration,
        isNewerVersion: false,
      });

    const result = await service.upsertFromCatalog(catalogParams);

    expect(result).toBe(existingRegistration);
    expect(updateFromManifestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        preventVersionDowngrade: true,
        additionalFields: {
          name: catalogParams.name,
          sourcePackage: catalogParams.sourcePackage,
        },
      }),
    );
  });

  it.each([true, false])(
    'should enqueue auto-upgrades only when the manifest update reports a newer version (%s)',
    async (isNewerVersion) => {
      const existingRegistration = buildExistingRegistration({
        sourceType: ApplicationRegistrationSourceType.NPM,
      });

      applicationRegistrationRepository.findOne.mockResolvedValue(
        existingRegistration,
      );
      jest.spyOn(service, 'updateFromManifest').mockResolvedValue({
        registration: existingRegistration,
        isNewerVersion,
      });
      const enqueueAutoUpgradeApplicationsSpy = jest
        .spyOn(service, 'enqueueAutoUpgradeApplications')
        .mockResolvedValue();

      await service.upsertFromCatalog(catalogParams);

      expect(enqueueAutoUpgradeApplicationsSpy).toHaveBeenCalledTimes(
        isNewerVersion ? 1 : 0,
      );
    },
  );

  it('should skip the catalog entry when the manifest update refuses a downgrade', async () => {
    applicationRegistrationRepository.findOne.mockResolvedValue(
      buildExistingRegistration({
        sourceType: ApplicationRegistrationSourceType.NPM,
        latestAvailableVersion: '1.0.0',
      }),
    );
    jest.spyOn(service, 'updateFromManifest').mockResolvedValue(null);

    const result = await service.upsertFromCatalog({
      ...catalogParams,
      latestAvailableVersion: '0.9.0',
    });

    expect(result).toBeNull();
  });

  it('should not erase a known version when the catalog entry has none', async () => {
    applicationRegistrationRepository.findOne.mockResolvedValue(
      buildExistingRegistration({
        sourceType: ApplicationRegistrationSourceType.NPM,
        latestAvailableVersion: '1.0.0',
      }),
    );
    const updateFromManifestSpy = jest.spyOn(service, 'updateFromManifest');

    const result = await service.upsertFromCatalog({
      ...catalogParams,
      latestAvailableVersion: null,
    });

    expect(result).toBeNull();
    expect(updateFromManifestSpy).not.toHaveBeenCalled();
  });

  it('should create new catalog registrations as listed', async () => {
    applicationRegistrationRepository.findOne.mockResolvedValue(null);

    await service.upsertFromCatalog(catalogParams);

    expect(applicationRegistrationRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ isListed: true }),
    );
  });
});
